const express = require('express');
const app = express();
const port = 9000;
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const fileUpload = require('express-fileupload');
const { execSync } = require('child_process');

app.use(express.static('www'));
app.use(fileUpload({
    limits: { fileSize: 25 * 1024 * 1024 },
    abortOnLimit: true,
    useTempFiles: true,
    tempFileDir: '/tmp/',
    safeFileNames: true,
    preserveExtension: true,
}));

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

app.post('/file_upload', async (request, response) => {
    const file = request.files.uploaded_image;
    const desired_file_path = path.join(path.join(__dirname, 'uploads'), file.name);
    // fix:
    console.log('Checking file extension and MIME type.');
    if (file.name.endsWith('.jpg') && file.mimetype === 'image/jpeg') {
        console.log('Checking file contents with file command.');
        const stdout = execSync(`file ${file.tempFilePath}`)
        if (stdout.includes('JPEG')) {
            // end fix
            file.mv(desired_file_path, (error) => {
                if (error) {
                    response.send(`Error while moving the file: ${error}.`);
                    response.end();
                    return;
                }
        
                response.statusCode = 200;
                response.setHeader('Content-Type', 'text/html');
                response.write(`File name: ${file.name}.`);
                response.write(`File size: ${file.size}.`);
                response.write(`File hash: ${file.md5}.`);
                response.write(`MIME type: ${file.mimetype}.`);
                response.write(`Temp path: ${file.tempFilePath}.`);
                response.write(`Dest path: ${desired_file_path}.`);
                response.end();
            });        
        }
    }
});

app.listen(port, () => {
    console.log(`Web server listening on ${port}`);
});