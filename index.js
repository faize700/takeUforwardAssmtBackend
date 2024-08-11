require('dotenv').config(); // Load environment variables from .env file

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mysql = require('mysql2');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Create a connection to the database using environment variables
const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT
});

// Connect to the database
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to the database.');
});

// Create the banner table if it doesn't exist
app.get('/init', (req, res) => {
  const sql = `
    CREATE TABLE IF NOT EXISTS banner (
      id INT AUTO_INCREMENT PRIMARY KEY,
      description VARCHAR(255),
      link VARCHAR(255),
      timer INT,
      visible BOOLEAN
    )
  `;
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.send('Banner table created or exists...');
  });
});

app.get('/', (req, res) => {
    res.send('Backend is running');
});

// API to get banner data
app.get('/banner', (req, res) => {
  const sql = 'SELECT * FROM banner WHERE id = 1';
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result[0]);
  });
});

// API to update banner data
app.put('/banner/:id', (req, res) => {
    const bannerId = req.params.id;
    const { description, timer, link, visible } = req.body;
  
    const query = `
      UPDATE banner 
      SET description = ?, timer = ?, link = ?, visible = ?
      WHERE id = ?
    `;
  
    connection.query(query, [description, timer, link, visible, bannerId], (error, results) => {
      if (error) {
        return res.status(500).json({ error: 'Database update failed' });
      }
      res.status(200).json({ message: 'Banner updated successfully' });
    });
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
