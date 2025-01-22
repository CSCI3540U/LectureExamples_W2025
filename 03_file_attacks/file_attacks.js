const express = require('express');
const app = express();
const port = 9000;
const fs = require('fs');
const path = require('path');

app.use(express.static('www'));

app.get('/admin', (request, response) => {
    response.send('Admins welcome!');
});

app.get('/open_redirect', (request, response) => {
    const redirect_url = request.query['dest'];
    response.redirect(redirect_url);
});

app.get('/local_file_inclusion', (request, response) => {
    const filename = request.query['page'];
    // also vulnerable to directory traversal
    response.setHeader('Content-Type', 'text/html');
    response.sendFile(__dirname + `/${filename}`);
});

app.get('/directory_traversal', (request, response) => {
    const filename = request.query['page'];
    const file_path = __dirname + '/' + filename;
    fs.readFile(file_path, (error, data) => {
        if (error) {
            console.error(error);
            return;
        }
        response.send(data);
    });
});

app.listen(port, () => {
    console.log(`Web server listening on ${port}`);
});