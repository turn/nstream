// content of index.js
const http = require('http');
const path = require('path');
const request = require('request');
const async = require('async');
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

app.get(
    '/reporting', (request, response) => {
        response.render('reporting');
    }
);

app.get(
    '/getUsers', (req, res) => {

        var urls = [
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984210&response-formatter=json',
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984208&response-formatter=json',
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984214&response-formatter=json',
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984213&response-formatter=json',
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984487&response-formatter=json',
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984488&response-formatter=json',
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984489&response-formatter=json',
            'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984490&response-formatter=json'
        ];

        function requester(url, done) {
            console.log('request: %s', url);
            request(
                url, function(err, r, body) {
                    if (err) {
                        return done(err);
                    }
                    done(null, JSON.parse(body));
                }
            )
        }

        async.map(
            urls, requester, function(err, r) {
                if (err) {
                    console.log('ERROR: ', err);
                    return;
                }
                res.send(
                    {
                        fashion0: r[0],
                        fashion1: r[1],
                        fashion2: r[2],
                        fashion3: r[3],
                        car0: r[4],
                        car1: r[5],
                        car2: r[6],
                        car3: r[7]
                    }
                )
            }
        );
    }
);

/**
 app.get(
 '/getUsers', (req, res) => {
        async.map(
            [
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984210&response-formatter=json',
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984208&response-formatter=json',
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984214&response-formatter=json',
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984213&response-formatter=json',
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984487&response-formatter=json',
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984488&response-formatter=json',
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984489&response-formatter=json',
                'http://prof084.sjc2.turn.com:4900/execute?command=command+streamer+&action=dump_users&turn_category_id=31984490&response-formatter=json'
            ],
            function(file, cb) {
                request.get(
                    file, function(err, response, body) {
                        if (err) {
                            cb(err);
                        }
                        else {
                            cb(null, body); // First param indicates error, null=> no error
                        }
                    }
                );
            },
            function(err, results) {
                if (err) {
                    res.send(err);
                }
                else {
                    res.send(
                        {
                            fashion0: results[0],
                            fashion1: results[1],
                            fashion2: results[2],
                            fashion3: results[3],
                            auto1: results[4],
                            auto2: results[5],
                            auto3: results[6],
                            auto4: results[7],
                        }
                    )
                }
            }
        );
    }
 );
 **/

app.listen(
    port, (err) => {
        if (err) {
            return console.log(err)
        }

        console.log(`server is listening on ${port}`)
    }
);