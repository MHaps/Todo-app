const form = document.getElementById('taskForm');
const taskInput = document.getElementById('taskInput');
const taskList = document.getElementById('taskList');

// Function to add a task element to the DOM
function addTaskToDOM(task) {
  const listItem = document.createElement('li');

  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.id = `task-${task.id}`;
  checkbox.checked = task.completed;

  checkbox.addEventListener('change', async () => {
    try {
      await fetch(`http://localhost:5000/tasks/${task.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: checkbox.checked })
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  });

  const taskText = document.createElement('span');
  taskText.textContent = task.title;

  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'Delete';
  deleteButton.addEventListener('click', async () => {
    try {
      await fetch(`http://localhost:5000/tasks/${task.id}`, {
        method: 'DELETE'
      });
      listItem.remove();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  });

  listItem.appendChild(checkbox);
  listItem.appendChild(taskText);
  listItem.appendChild(deleteButton);
  taskList.appendChild(listItem);
}

// Add Task
form.addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevent form submission from refreshing the page

  const title = taskInput.value.trim(); // Get the task title from the input field

  if (title === '') return; // Prevent adding empty tasks

  try {
    const response = await fetch('http://localhost:5000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ title })
    });

    if (response.ok) {
      const newTask = await response.json();
      console.log('New task created:', newTask);
      addTaskToDOM(newTask); // Add the new task to the DOM
      taskInput.value = ''; // Reset the input field
    } else {
      console.error('Failed to create task');
    }
  } catch (error) {
    console.error('Error:', error);
  }
});

// Load and display existing tasks on DOM content loaded
window.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('http://localhost:5000/tasks');
    const tasks = await response.json();

    tasks.forEach(task => {
      addTaskToDOM(task);
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
  }
});
