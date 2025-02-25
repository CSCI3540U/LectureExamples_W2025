const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const port = 9000;
const session = require('express-session');
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database('./auth.db');

let nextSessionId = 1;
let sessionData = { };

db.serialize(() => {
    db.run(`create table if not exists Login(
        email text primary key not null,
        password text not null,
        role text
    )`);
    db.run('delete from Login');
    db.run(`insert into Login(email, password, role) values(?, ?, ?)`, ['robert@abc.com', 'burt', 'user']);
    db.run(`insert into Login(email, password, role) values(?, ?, ?)`, ['bsmith@abc.com', 'barby', 'user']);
    db.run(`insert into Login(email, password, role) values(?, ?, ?)`, ['akhan@abc.com', 'ahmed', 'user']);
    db.run(`insert into Login(email, password, role) values(?, ?, ?)`, ['admin@abc.com', 'secret123', 'admin']);
    console.log('Login table created.');
    db.each('select * from Login', (error,row) => {
        console.log(`   ${row['email']},${row['password']},${row['role']}`);
    });
});

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.use(express.static('static'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(session({
    resave: false,
    saveUninitialized: false,
    secret: 'apollo makes great donuts'
}));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/home', (request, response) => {
    const sessionId = request.cookies['session_id'];
    // console.log(`sessionData = ${JSON.stringify(sessionData[sessionId])}`);
    if (sessionData[sessionId]['email']) {
        response.send(`Welcome, ${sessionData[sessionId]['email']}! Role: ${sessionData[sessionId]['role']}.<br /><a href="/login">Log In Again</a>`);
        response.end();
        return;
    }
    response.redirect('/login');
});

app.get('/login', (request, response) => {
    response.render('login', {
        title: 'Please Sign In',
        errorMessage: ''
    });
});

app.post('/login', (request, response) => {
    const email = request.body.email;
    const password = request.body.password;

    sleep(5 /*500*/).then(() => {
        // db.all(`select email, role from Login where email = ? and password = ?`, [email, password], (error, rows) => {
        db.all(`select email, role from Login where email = '${email}' and password = '${password}'`, (error, rows) => {
            if ((error && error !== null) || rows.length == 0) {
                console.log(`FAILED: Result of query: ${rows}, error: ${error}`);

                // invalid login
                response.render('login', {
                    title: 'Login Page',
                    errorMessage: error
                });
            } else {
                let loginEmail = rows[0]['email'];
                let role = rows[0]['role'];
                console.log(`Login success: ${loginEmail}`);

                // email and password are a match
                response.cookie('session_id', `${nextSessionId}`);
                sessionData[nextSessionId] = {email: loginEmail, role: role};
                nextSessionId++;

                response.redirect(`/profile/${loginEmail}`);
            }
        });
    });
});

app.get('/logout', (request, response) => {
    // request.session.email = '';
    response.redirect('/login');
});

// access control

app.get('/profile/:email', (request, response) => {    
    const sessionId = request.cookies['session_id'];
    const email = sessionData[sessionId]['email'];
    const role = sessionData[sessionId]['role'];

    const emailParam = request.params['email'];

    if ((email === emailParam) || (role === 'admin')) {
        response.send(`Ciao ${email}!  Your role is ${role}<br /><a href="/login">Log In Again</a>`);
    } else {
        response.status(400).send('Cannot view profile.');
    }
});

app.get('/order-status', (request, response) => {
    const orderId = request.query['order-id'];

    response.send(`Viewing order ${orderId}`);
});

app.listen(port, () => {
    console.log(`Listening on pot ${port}.`)
});
