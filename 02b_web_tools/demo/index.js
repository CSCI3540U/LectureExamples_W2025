const express = require('express');
const app = express();
const port = 9000;

app.use(express.static('www'));
app.use(express.urlencoded({extended: false}));

app.post('/login', (request, response) => {
    const username = request.body.username;
    const password = request.body.password;

    if (username === 'admin' && password === '12345') {
        response.sendFile(__dirname + '/www/admin/secrets.txt');
    } else {
        response.status(401).send('Login incorrect');
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});