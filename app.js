const express = require('express');
const app = express();
const pgp = require('pg-promise')();
const cors = require('cors');
app.use(cors()); // Add this line before your routes
app.use(express.json()); // Middleware to parse JSON bodies

// Database connection configuration
const db = pgp({
    host: 'localhost',
    port: 5432,
    database: 'todo_app',
    user: 'postgres',
    password: 'password'
});

// Test the database connection
db.connect()
    .then(obj => {
        obj.done(); // success, release the connection;
        console.log('Connected to the database');
    })
    .catch(error => {
        console.error('Error connecting to the database:', error.message || error);
    });

// Get all tasks
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await db.any('SELECT * FROM tasks');
        res.json(tasks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create a new task
app.post('/tasks', async (req, res) => {
    const { title } = req.body;
    try {
        const newTask = await db.one('INSERT INTO tasks (title) VALUES ($1) RETURNING *', [title]);
        res.status(201).json(newTask);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Update Task
app.patch('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    const { completed } = req.body; // Assuming only 'completed' is sent for update
  
    try {
      const updatedTask = await db.one(
        'UPDATE tasks SET completed = $1 WHERE id = $2 RETURNING *',
        [completed, id]
      );
      res.json(updatedTask);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Delete a task
app.delete('/tasks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.none('DELETE FROM tasks WHERE id = $1', [id]);
        res.status(204).end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
