const express = require('express');
const app = express();
const port = 9000;
const fs = require('fs');
const path = require('path');
const axios = require('axios');

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
    console.log(`filename: ${filename}`)
    console.log(`file_path: ${file_path}`)
    fs.realpath(file_path, (error, resolved_path) => {
        if (error) {
            console.error(error);
            return;
        }
        console.log(`resolved_path = ${resolved_path}`);
        if (resolved_path.startsWith(__dirname)) {
            fs.readFile(resolved_path, (error, data) => {
                if (error) {
                    console.error(error);
                    return;
                }
                response.send(data);
            });    
        } else {
            console.log(`Trying to access outside dir: ${resolved_path}`);
        }
    });
});

app.get('/remote_file_inclusion', async (request, response) => {
    let url = request.query['page'];
    try {
        let url_response = await axios.get(url);
        response.send(url_response.data);
    } catch (error) {
        response.status(500).send(`Error: ${error}`);
    }
});

app.listen(port, () => {
    console.log(`Web server listening on ${port}`);
});