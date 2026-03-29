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
db.exec(`
    CREATE TABLE IF NOT EXISTS jobs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        company TEXT NOT NULL,
        position TEXT NOT NULL,
        status TEXT NOT NULL,
        date_applied TEXT NOT NULL
    )
`);

app.post('/add-job', (req, res) => {
    const {username, company, position, status, date_applied } = req.body;

    const stmt = db.prepare(`
        INSERT INTO jobs (username, company, position, status, date_applied)
        VALUES (?, ?, ?, ?, ?)
    `);

    stmt.run(username, company, position, status, date_applied);

    res.redirect('/User-home?username=' + username);
});

app.get('/add-job', (req, res) => {
    const username = req.query.username;
    res.sendFile(path.join(__dirname, 'add-job.html'));
})

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

    const stmt = db.prepare(`
        SELECT * FROM users
        WHERE username = ? AND password = ?
        `);
    
    const row = stmt.get(username, password);
        if (row) {
            res.redirect('/User-home?username=' + username);
        }

        else {
            res.redirect('/?loginError=Invalid username or password');
        }
    

    

    console.log("Login username:", username);
    console.log("Login password:", password);

    
});

app.get('/User-home', (req, res) => {
    res.sendFile(path.join(__dirname, 'User-home.html'));
});

app.post('/register', (req, res) => {
    const {username, password} = req.body;

    if (username.length > 10){
        return res.redirect('/register?userError=Username must be less than 10 characters');
    }

    if (!usernamePattern.test(username)){
        return res.redirect('/register?userError=Username must contain only letters');
    }

    if (!passwordPattern.test(password)){
        return res.redirect('/register?passError=Password must contain only letters and numbers');
    }

    if (password.length < 6 || password.length > 16){
        return res.redirect('/register?passError=Password must be between 6 and 16 characters');
    }

    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password)){
        return res.redirect('/register?passError=Password must contain both uppercase and lowercase letters');
    }

    

    const stmt = db.prepare(`
        INSERT INTO users (username, password)
        VALUES (?, ?)
    `);

    stmt.run(username, password);

    console.log("Username:", username);
    console.log("Password:", password);

    res.send(
        `<html>
        <head>
            <title>Success</title>
            <meta http-equiv="refresh" content="2;url=/" />
        </head>
        <body style="text-align:center; margin-top:200px;">
            <h2>Registration successful!</h2>
            <p>Redirecting to login page in 2 seconds...</p>
        </body>
        </html>`);

})

app.get('/jobs', (req, res) => {
    const username = req.query.username;

    const stmt = db.prepare(`
        SELECT * FROM jobs
        WHERE username = ?
    `);

    const jobs = stmt.all(username);

    res.json(jobs);
});



app.post('/update-job', express.json(), (req, res) => {
    const { id, company, position, status, date_applied } = req.body;

    const stmt = db.prepare(`
        UPDATE jobs
        SET company = ?, position = ?, status = ?, date_applied = ?
        WHERE id = ?
    `);

    stmt.run(company, position, status, date_applied, id);

    res.send("Updated");
});

app.post('/delete-job', express.json(), (req, res) => {
    const { id } = req.body;

    const stmt = db.prepare(`
        DELETE FROM jobs
        WHERE id = ?
    `);

    stmt.run(id);

    res.send("Deleted");
});



app.listen(port, () => {
    console.log('http://localhost:'+port);
})