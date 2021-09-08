/* 
**
** Project Name: 
** Author: 
** Date:  
**
*/
// Defendency
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
const fs = require('fs-extra');
const fileUpload = require('express-fileupload');
require('dotenv').config();

// app config
const port = 9000;
const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static('service'));
app.use(fileUpload());

// Mongodb connection
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.or4h7.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

client.connect(err => {
    //collections
    const articleCollection = client.db('truthspeech').collection('articles');
    const adminCollection = client.db('truthspeech').collection('admins');
    const empCollection = client.db('truthspeech').collection('collection');

    // URSER ROUTES
    //:::::::::::::::::::::::::: ADD ARTICLE ::::::::::::::::::::::

    app.post('/post-article', (req, res) => {
        const file = req.files.file;
        const author = req.body.author;
        const category = req.body.category;
        const title = req.body.title;
        const article = req.body.article;
        const newImg = file.data;
        const encImg = newImg.toString('base64');

        var image = {
            contentType: file.mimetype,
            size: file.size,
            img: Buffer.from(encImg, 'base64'),
        };

        articleCollection
            .insertOne({ author, category, title, article, image })
            .then((result) => {
                res.send(result.insertedCount > 0);
            });
    });

    //:::::::::::::::::::::::: ADD ADMIN::::::::::::::::::::::::::
    app.post('/addAdmin', (req, res) => {
        const newAdmin = req.body;
        adminCollection.insertOne(newAdmin).then((result) => {
            // console.log(result)
            res.send(result.insertedCount > 0);
        });
    });

    //:::::::::::::::::::: VERIFY ADMIN LOGIN ::::::::::::::::::::
    app.post('/isAdmin', (req, res) => {
        const email = req.body.email;
        adminCollection.find({ email: email })
            .toArray((err, admins) => {
                console.log(admins);
                res.send(admins.length > 0);
            })
    })

    //::::::::::::::::::::::: GET ALL ARTICLE ::::::::::::::::::::::
    app.get('/articles', (req, res) => {
        articleCollection.find({}).toArray((err, documents) => {
            res.send(documents);
        });
    });

     //::::::::::::::::::::::: GET HERO SECTION ARTICLE ::::::::::::::::::::::
     app.get('/hero-articles', (req, res) => {
        articleCollection.find({}).limit(4).toArray((err, documents) => {
            res.send(documents);
        });
    });

});

// Root:
app.get('/', (req, res) => {
    res.send(`
    <html>
    <head><title>The Truth Speech</title><style>h1{color:red;}</style></head>
    <body><marquee><h1>Server Is Running On Port:4000</h1></marquee></body>
    </html>
    `);
});

// Listener port
app.listen(process.env.PORT || port);
