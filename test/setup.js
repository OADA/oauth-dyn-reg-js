/* Copyright 2015 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *         http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var express = require('express');
var cors = require('cors');
var fs = require('fs');

var metadata = require('./metadata.json');
var token = fs.readFileSync('./test/token').toString().replace(/\n$/, '');
var regErr = require('./registration_err.json');

var app = express();

app.use(cors());

app.post('/echo', function(req, res) {
    res.writeHead(201, req.headers);
    req.pipe(res);
});

app.post('/type/*', function(req, res) {
    if (req.is(req.params[0])) {
        res.status(201).end();
    } else {
        res.status(406).end();
    }
});

app.post('/accept/*', function(req, res) {
    if (req.accepts(req.params[0])) {
        res.set('Content-Type', req.params[0]).status(201).end();
    } else {
        res.status(406).end();
    }
});

app.post('/metadata', function(req, res) {
    res.send(metadata);
});

app.post('/oauth', function(req, res) {
    if (req.get('Authorization') === token) {
        res.status(201).end();
    } else {
        res.status(401).end();
    }
});

app.post('/http_error', function(req, res) {
    res.status(500).send('sadasdsadasd');
});

app.post('/error', function(req, res) {
    res.status(400).send(regErr);
});

app.post('/error_only', function(req, res) {
    var err = {error: regErr.error};
    res.status(400).send(err);
});

app.listen(3000);
