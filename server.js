const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors());

// Database Connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', 
    password: '', // Enter your MySQL password here
    database: 'm_league_fantasy'
});

// 1. REGISTER API
app.post('/api/register', async (req, res) => {
    const { email, managerName, teamName, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    // Transaction: Create User -> Then Create Team
    db.query('INSERT INTO users (email, password_hash, manager_name) VALUES (?, ?, ?)', 
    [email, hashedPassword, managerName], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        
        const userId = result.insertId;
        db.query('INSERT INTO fantasy_teams (user_id, team_name) VALUES (?, ?)', 
        [userId, teamName], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ message: 'Manager registered successfully!' });
        });
    });
});

// 2. LOGIN API
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    db.query('SELECT * FROM users WHERE email = ?', [email], async (err, results) => {
        if (err) return res.status(500).json({ error: err.message });
        if (results.length === 0) return res.status(401).json({ error: 'User not found' });

        const match = await bcrypt.compare(password, results[0].password_hash);
        if (match) {
            res.json({ message: 'Login successful', manager: results[0].manager_name });
        } else {
            res.status(401).json({ error: 'Invalid password' });
        }
    });
});

app.listen(3000, () => {
    console.log('M-League Server running on port 3000');
});
