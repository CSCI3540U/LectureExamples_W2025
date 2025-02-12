const express = require('express');
const app = express();
const cookieParser = require('cookie-parser');
const port = 9000;
const session = require('express-session');

// let nextSessionId = 1;

// let sessionData = {
//     '1': {
//         email: 'admin@abc.com',
//         role: 'administrator'
//     }
// };


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
    // let sessionId = request.cookies['session_id'];
    // console.log(`sessionId = ${sessionId}`);

    // if (sessionId) {
    //     let email = sessionData[sessionId]['email'];
    //     let role = sessionData[sessionId]['role'];
    //     if (email) {
    //         response.send(`Welcome, ${email}! Role: ${role}.`);
    //         response.end();
    //         return;
    //     }
    // }
    // fix:
    if (request.session.email) {
        response.send(`Welcome, ${request.session.email}! Role: ${request.session.role}.`);
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

    sleep(500).then(() => {
        if (userExists(email)) {
            if (checkPassword(email, password)) {
                // login success
                // nextSessionId++;
                // const sessionId = nextSessionId;
                // response.cookie('session_id', sessionId);
                // sessionData[sessionId] = {
                //     email: email,
                //     role: 'user'
                // };
                // fix:
                request.session['email'] = email;
                request.session.role = 'user';
                if (email === 'admin@abc.com') {
                    request.session.role = 'admin';
                }
                response.redirect('/home');
                return;
            }
        }
        response.status(401).render('login', {
            title: 'Please Sign In',
            errorMessage: 'Incorrect login.'
        });
    });
});

app.get('/logout', (request, response) => {
    // request.session.email = '';
    response.redirect('/login');
});

// access control

app.get('/profile/:email', (request, response) => {
    // const sessionId = request.cookies['session_id;'];
    // console.log(`sessionId = ${sessionId}`);
    // const email = sessionData[sessionId]['email'];
    const email = request.session.email;
    const role = request.session.role;
    const emailParam = request.params['email'];

    if (((email === emailParam) || (role === 'admin')) && (emailParam in loginData)) {
        response.send(`Ciao ${email}!  Your role is ${role}`);
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
