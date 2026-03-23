const express = require('express');
const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));

const db = new DatabaseSync('users.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    username TEXT NOT NULL,
    password TEXT NOT NULL
  )
`);

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'home.html'));
});

const usernamePattern = /^[A-Za-z]+$/;
const passwordPattern = /^[A-Za-z0-9]+$/;

app.get('/register', (req, res) => {
    res.sendFile(path.join(__dirname, 'register.html'));
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    console.log("Login username:", username);
    console.log("Login password:", password);

    res.send("This is login. Not saving into database yet.");
});

app.post('/register', (req, res) => {
    const {username, password} = req.body;

    if (username.length > 10){
        return res.send
    }

    const stmt = db.prepare(`
        INSERT INTO users (username, password)
        VALUES (?, ?)
    `);

    stmt.run(username, password);

    console.log("Username:", username);
    console.log("Password:", password);

    res.send('got you!!!');

})

app.listen(port, () => {
    console.log('http://localhost:'+port);
})