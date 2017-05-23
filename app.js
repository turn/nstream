// content of index.js
const http = require('http');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '')));

app.get(
    '/', (request, response) => {
        response.render('home');
    }
);

app.listen(
    port, (err) => {
        if (err) {
            return console.log(err)
        }

        console.log(`server is listening on ${port}`)
    }
);