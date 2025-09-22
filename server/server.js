const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require ('bcrypt');
const { v4: uuidv4 } = require ('uuid');
const cors = require ('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());


const db = new sqlite3.Database('./ngilo.db', (err) => {
    if (err) {
        console.error('Error connecting', err.message);
    } else {
        console.log('Connected to the database.');
    }
});



db.run(`
    CREATE TABLE IF NOT EXISTS users (
        user_id TEXT PRIMARY KEY,
        username TEXT UNIQUE,
        password TEXT
    )
`, (err) => {
    if (err) console.error("Error creating users table:", err.message);

db.run(`
    CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT,
        message TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id)
    )
`, (err) => {
    if (err) console.error("Error creating messages table:", err.message);
});
});


app.post('/api/signup', async (req, res) => {
    const { username, password }  = req.body;
    if (!username || !password) {
        return res.status(400).send('Username and password are required.');
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = uuidv4();

        db.run(
            'INSERT INTO users (user_id, username, password) VALUES (?, ?, ?)',
            [userId, username, hashedPassword],
            function (err) {
                if (err) {
                    console.error(err.message);
                    return res.status(400).send('Username already exists.');
                }
                res.status(200).send({ userId, username });
            }
        );      
    }catch(error) {
        console.error(error);
        res.status(500).send('Server error during signup.');
    }
});


app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    if (!username || !password ) {
        return res.status(400).send('Username and password are required.');
    }

    db.get(`SELECT * FROM users WHERE username = ?`, [username], async (err, user) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Server error.');
        }
        if (!user) {
            return res.status(400).send('Invalid username and password.');
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).send('Invalid username or password.');
        }

        res.status(200).send({ userId: user.user_id, username: user.username });
    });
});


app.get('/api/user/:userId', (req, res) => {
    const { userId } = req.params;

    db.get(`SELECT username FROM users WHERE user_id = ?`, [userId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(500).send('Server error');
        }
        if(!row) {
            return res.status(500).send('User not found');
        }
        res.status(200).json({ username: row.username });
    });
});


app.post('/api/send-message', (req, res) => {
    const { recipientId, message } = req.body;

    if(!recipientId || !message) {
        return res.status(400).send('Recipient ID and message are required.');
    }


    db.get(`SELECT user_id FROM users WHERE user_id = ?`, [recipientId], (err, row) => {
        if (err) {
            console.error(err.message);
            return res.status(404).send('Recipient user not found.');
        }
        if(!row) {
            return res.status(404).send('Recipient user not found.');
        }

        db.run(
            `INSERT INTO messages (user_id, message) VALUES (?, ?)`,
            [recipientId, message],
            (err) => {
                if (err) {
                    console.error(err.message);
                    return res.status(500).send('Failed to send message.');
                }
                res.status(200).send('Message sent successfully.');
            }
        );
    });
});


app.get('/app/messages/:userId', (req, res) => {
    const { userId } = req.params;

    db.all(
        `SELECT message, timestamp FROM messages WHERE user_id = ? ORDER BY timestamp DESC`,
        [userId],
        (err, rows) => {
            if (err) {
                console.error(err);
                return res.status(500).send('Failed to retrieve messages.');
            }
            res.status(200).send(rows);
        }
    );
});


app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}
)