const express = require('express');
const app = express();
const port = 9000;

// cookie processing
const cookieParser = require('cookie-parser');

let nextSessionId = 12345678901;

let sessionData = {};

// middleware

// serve static files in www/
app.use(express.static('www'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

// GET parameters
app.get('/get_params', (request, response) => {
	console.log(`Parameters: ${request.query['firstname']}`);
	response.send('HOME PAGE');
});

// POST parameters
app.post('/post_params', (request, response) => {
	console.log(`Parameters: ${request.body['email']}`);
	response.send(`Hello, ${request.body['email']}!`);
});

// route parameters
app.get('/route_params/:category/:id', (request, response) => {
	console.log(`Category: ${request.params['category']}`);
	console.log(`Id: ${request.params['id']}`);
	response.send(`Hello, ${request.params['category']}!`);
});

// an anchor, used only on the client
// https://example.com/register#recover_password

app.get('/home', (request, response) => {
	console.log(request.cookies);

	const sessionId = request.cookies['session-id'];

	if (sessionId) {
		response.send(`Welcome, ${sessionData[sessionId]}
			<div><a href="/logout">Logout</a></div>
		`);
	} else {
		response.redirect('/login.html');
	}
});

app.post('/login', (request, response) => {
    if (request.body.email === 'admin@abc.com' &&
            request.body.password === '12345') {
	// get ready for the next session
	nextSessionId++;

	//  add their data to the session
	sessionData[`${nextSessionId}`] = request.body.email;

	// store the session ID as a cookie
	response.cookie('session-id', `${nextSessionId}`, {
		path: '/',
		secure: false, // for testing only
		httpOnly: true
	});

	// go to the main page
	//response.redirect('/home');
	response.sendFile(__dirname + '/www/admin/secret.txt');
    } else {
	response.status(401).send('Login incorrect');
    }
});

app.get('/logout', (request, response) => {
	const sessionId = request.cookies['session-id'];

	if (sessionId) {
		// remove the session data
		delete sessionData[sessionId];

		// remove the session cookie
		response.clearCookie('session-id');
	}

	response.redirect('/login');
});

app.listen(port, () => {
	console.log(`Server running on port ${port}`);
});
