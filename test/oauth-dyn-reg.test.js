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

var expect = require('chai').expect;
var nock = require('nock');
var register = require('../');

var serverUri = 'https://identity.oada-dev.com';
var server;

describe('oauth-dyn-reg', function() {
    beforeEach(function() {
        server = nock(serverUri);
    });

    afterEach(function() {
        nock.cleanAll();
    });

    it('should POST client metadata', function(done) {
        var endpoint = '/register';
        var metadata = {
            a: 1,
            b: 2,
            c: 'a'
        };

        server.post(endpoint, metadata).once().reply(200);

        register(metadata, serverUri + endpoint, function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.be.ok;
            done();
        });
    });

    it('should POST with Content-Type application/json', function(done) {
        var endpoint = '/register';

        server.matchHeader('Content-Type', 'application/json')
            .post(endpoint)
            .once()
            .reply(200);

        register({}, serverUri + endpoint, function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.be.ok;
            done();
        });
    });

    it('should accept application/json', function(done) {
        var endpoint = '/register';

        server.matchHeader('Accept', 'application/json')
            .post(endpoint)
            .once()
            .reply(200);

        register({}, serverUri + endpoint, function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.be.ok;
            done();
        });
    });

    it('should pass responded metadata to callback', function(done) {
        var endpoint = '/register';
        var metadata = {
            a: 1,
            b: 2,
            c: 'a'
        };

        server.post(endpoint).once().reply(200, metadata);

        register({}, serverUri + endpoint, function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.deep.equal(metadata);
            done();
        });
    });

    it('should work with just a software statement', function(done) {
        var endpoint = '/register';
        var softwareStatement = 'FOOBAR32';

        server.post(endpoint, {'software_statement': softwareStatement})
            .once()
            .reply(200);

        register(softwareStatement, serverUri + endpoint, function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.be.ok;
            done();
        });
    });

    describe('optional OAuth 2.0', function() {
        var token = 'DEAD BEEF';

        it('should use OAuth 2.0 when given a token', function(done) {
            var endpoint = '/register_oauth';

            server.matchHeader('Authorization', token)
                .post(endpoint)
                .once()
                .reply(200);

            register({}, serverUri + endpoint, function(err, resp) {
                expect(err).to.be.not.ok;
                expect(resp).to.be.ok;
                done();
            }, token);
        });

        it('should not use OAuth 2.0 when not given a token', function(done) {
            var endpoint = '/register';

            server.matchHeader('Authorization', function (val) { return val === undefined })
                .post(endpoint)
                .once()
                .reply(200);

            register({}, serverUri + endpoint, function(err, resp) {
                expect(err).to.be.not.ok;
                expect(resp).to.be.ok;
                done();
            });
        });
    });

    describe('error handling', function() {
        it('should pass errors to callback', function(done) {
            register({}, server, function(err, resp) {
                expect(err).to.be.ok;
                expect(resp).to.be.not.ok;
                done();
            });
        });

        describe('for client registration errors', function() {
            it('should work with a description', function(done) {
                var endpoint = '/register';
                var error = {
                    'error': 'invalid_client_metadata',
                    'error_description':
                        'The grant type \'authorization_code\' must be' +
                        ' registered along with the response type \'code\'' +
                        ' but found only \'implicit\' instead.'
                };

                server.post(endpoint).once().reply(400, error);

                register({}, serverUri + endpoint, function(err, resp) {
                    expect(err).to.be
                        .an.instanceOf(register.ClientRegistrationError);
                    expect(err.name).to.equal(error['error']);
                    expect(err.message).to.equal(error['error_description']);
                    expect(resp).to.be.not.ok;
                    done();
                });
            });

            it('should work without a description', function(done) {
                var endpoint = '/register';
                var error = {
                    'error': 'invalid_client_metadata'
                };

                server.post(endpoint).once().reply(400, error);

                register({}, serverUri + endpoint, function(err, resp) {
                    expect(err).to.be
                        .an.instanceOf(register.ClientRegistrationError);
                    expect(err.name).to.equal(error['error']);
                    expect(err.message).to.equal(error['error_description']);
                    expect(resp).to.be.not.ok;
                    done();
                });
            });
        });

        it('should return JSON response body with HTTP errors', function(done) {
            var endpoint = '/register';
            var json = {
                'foo': 'bar',
                'a': 'b'
            };

            server.post(endpoint).once().reply(400, json);

            register({}, serverUri + endpoint, function(err, resp) {
                expect(err).to.not.be
                    .an.instanceOf(register.ClientRegistrationError);
                expect(resp).to.deep.equal(json);
                done();
            });
        });
    });
});
