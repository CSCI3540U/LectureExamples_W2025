const express = require('express');
const app = express();
const port = 9000;
const cookieParser = require('cookie-parser');

app.use(express.static('static'));
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());

let nextSessionId = 12345678901;
let sessionData = {};

app.get('/index', (request, response) => {
	response.send(`<!doctype html>
<html>
  <body>
    <h1>Index</h1>
  </body>
</html>
`);
});

app.post('/form_submit', (request, response) => {
	console.log(request.body);

	response.send('Ok');
});

app.get('/index/:stuff/:junk', (request, response) => {
	console.log(request.params);

	response.send('Ok');
});

app.get('/main', (request, response) => {
	console.log(request.query);

	response.send('Ok');
});

app.post('/login', (request, response) => {
	const sessionId = nextSessionId++;

	sessionData[`${sessionId}`] = request.body.username;

	response.cookie('session-id', `${sessionId}`, {
		path: '/',
		// secure: true,
		httpOnly: true,
	});

	response.redirect('/index')
});

app.get('/logout', (request,response) => {
	const sessionId = request.cookies['session-id'];

	if (sessionId) {
		delete sessionData[sessionId];

		response.clearCookie('session-id');
	}
});

app.listen(port, () => {
	console.log(`Web server listening in port ${port}`);
});
