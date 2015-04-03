/* Copyright 2015 Open Ag Data Alliance
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var request = require('superagent');

function ClientRegistrationError(resp) {
    this.message = resp['error_description'];
    this.name = resp['error'];
}
ClientRegistrationError.prototype = Object.create(Error.prototype);
ClientRegistrationError.constructor = ClientRegistrationError;

module.exports = function register(metadata, endpoint, callback, token) {
    var params = typeof metadata === 'object' ?
            metadata : {'software_statement': metadata};

    var req = request.post(endpoint)
        .type('application/json')
        .accept('application/json')
        .send(params);

    if (token) {
        req.set('Authorization', token.replace(/\n/, ''));
    }

    if (typeof req.buffer === 'function') {
        req.buffer();
    }

    req.end(function handleResponse(err, resp) {
        err = resp.error || err;
        resp = resp || err.respsonse;

        // Handle registration erros as defined in RFC
        if (err && err.status === 400 && resp.body.error) {
            err = new ClientRegistrationError(resp.body);
            resp = null;
        }

        return callback(err, resp && (resp.body || resp.text));
    });
};

module.exports.ClientRegistrationError = ClientRegistrationError;
