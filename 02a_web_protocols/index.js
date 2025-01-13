const express = require('express');
const app = express();
const port = 9000;

app.use(express.static('static'));

app.use(express.urlencoded({extended: false}));

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

app.listen(port, () => {
	console.log(`Web server listening in port ${port}`);
});
