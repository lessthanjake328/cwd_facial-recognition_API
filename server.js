const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cors = require('cors');
const knex = require('knex')
const helmet = require('helmet');
const saltRounds = 10;

const register = require('./controllers/register');
const signin = require('./controllers/signin');
const rootPath = require('./controllers/rootPath');
const profile_Id = require('./controllers/profile_Id');
const imagePath = require('./controllers/imagePath');

const portNum = process.env.PORT || 3000;

let db = {};

let localServer;

if (process.env.PORT) {
    localServer = false;
} else {
    localServer = true;
}

if (localServer) {
    db = knex({
        client: 'pg',
        connection: {
            host: '127.0.0.1',
            user: '',
            password: '',
            database: 'smart-brain'
        }
    })
    console.log('server running locally');
} else {
    db = knex({
        client: 'pg',
        connection: {
            connectionString: process.env.DATABASE_URL,
            ssl: true
        }
    });
    console.log('server running on heroku');
}

const app = express();

app.use(helmet());

// app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => { rootPath.handleRootGET(req, res, db) });

app.post('/signin', (req, res) => { signin.handleSigninPOST(req, res, db, bcrypt) });

app.post('/register', (req, res) => { register.handleRegisterPOST(req, res, db, bcrypt, saltRounds) });

app.get('/profile/:id', (req, res) => { profile_Id.handleProfile_IdGET(req, res, db) });

// Add a GET for /image which returns list of images posted by logged in user
app.get('/image/:email', (req, res) => { imagePath.handleImageGET(req, res, db) });

// Add a POST for /image which puts each image URL in an images table and returns a new list of images entered by logged in user
app.post('/image', (req, res) => { imagePath.handleImagePOST(req, res, db) });

app.put('/image', (req, res) => { imagePath.handleImagePathPUT(req, res, db) });
app.post('/imageurl', (req, res) => { imagePath.handleClarifaiApiCall(req, res) });

app.listen(portNum, () => {
    console.log(`app running on port ${portNum}`);
});


/*
    / --> res = this is working
    /signin --> POST = success/fail
    /register --> POST = user
    /profile/:userId --> GET = user
    /image --> PUT --> user & count
*/

/*
    /image --> POST = add to posts db
*/