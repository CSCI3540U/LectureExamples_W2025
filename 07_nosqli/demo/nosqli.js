const express = require('express');
const app = express();
const port = 9000;
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb+srv://monmin:csci3540u@mongodemo.0eclq.mongodb.net/?retryWrites=true&w=majority&appName=MongoDemo');
}

const User = mongoose.model('User', new mongoose.Schema({ email: String, password: String }));
const user1 = new User({ email: 'admin@abc.com', password: "openup" });
user1.save(); 

app.use(express.static('static'));
app.use(express.json());
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

app.get('/login', (request, response) => {
    response.render('login', {
        title: 'Please Sign In'
    });
});

app.post('/login', async (request, response) => {
    const { email, password } = request.body;

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+(\.[a-zA-Z]+)+$/;
    const passwordRegex = /^[a-zA-Z0-9_\--&.!?]+$/;

    if (emailRegex.test(email) && passwordRegex.test(password)) {
        const query = { 
            email: String(request.body.email),
            password: String(request.body.password)
            // email, password
        };
        console.log(`query: ${JSON.stringify(query)}`);

        const user = await User.findOne(query);

        if (user) {
            response.json({
                message: "Success",
            });
        } else {
            response.status(401).json({
                message: "Login Incorrect",
            });
        }
    }
});

app.get('/logout', (request, response) => {
    response.redirect('/login');
});

app.listen(port, () => {
    console.log(`Listening on port ${port}.`)
});
