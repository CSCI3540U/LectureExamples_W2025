const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const port = 9000;

let nextSessionId = 1;

let sessionData = {
    '1': {
        email: 'admin@abc.com',
        role: 'administrator'
    }
};

let loginData = {
    'admin@abc.com': 'v05!j_R',
    'robert@abc.com': 'burt',
    'sandra@abc.com': 'galdalf5',
};

function userExists(toFind) {
    return Object.keys(loginData).includes(toFind);
}

function checkPassword(email, password) {
    return loginData[email] === password;
}

app.use(express.static('static'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/home', (request, response) => {
    let sessionId = request.cookies['session_id'];
    console.log(`sessionId = ${sessionId}`);

    if (sessionId) {
        let email = sessionData[sessionId]['email'];
        let role = sessionData[sessionId]['role'];
        if (email) {
            response.send(`Welcome, ${email}! Role: ${role}.`);
            response.end();
            return;
        }
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

    if (userExists(email)) {
        if (checkPassword(email, password)) {
            // login success
            nextSessionId++;
            const sessionId = nextSessionId;
            response.cookie('session_id', sessionId);
            sessionData[sessionId] = {
                email: email,
                role: 'user'
            };
            response.redirect('/home');
        } else {
            response.status(401).render('/login', {
                title: 'Please Sign In',
                errorMessage: 'Password does not match.'
            });
        }
    } else {
        response.status(401).render('/login', {
            title: 'Please Sign In',
            errorMessage: 'No such user exists.'
        });
    }
});

app.get('/logout', (request, response) => {
    // request.session.email = '';
    response.redirect('/login');
});

app.listen(port, () => {
    console.log(`Listening on pot ${port}.`)
});
