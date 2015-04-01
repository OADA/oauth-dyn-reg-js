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

var fs = require('fs');
var expect = require('chai').expect;
var register = require('../');

describe('oauth-dyn-reg', function() {
    var metadata;
    var serverUri;
    var statement;

    before(function(done) {
        metadata = require('./metadata.json');
        serverUri = 'http://localhost:3000';
        fs.readFile('./test/software_statement.jwt', function(err, data) {
            if (err) { return done(err); }
            statement = data.toString();
            done();
        });
    });

    it('should POST client metadata', function(done) {
        register(metadata, serverUri + '/echo', function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.deep.equal(metadata);
            done();
        });
    });

    it('should POST with Content-Type application/json', function(done) {
        register({}, serverUri + '/type/application/json', function(err) {
            expect(err).to.be.not.ok;
            done();
        });
    });

    it('should accept application/json', function(done) {
        register({}, serverUri + '/accept/application/json', function(err) {
            expect(err).to.be.not.ok;
            done();
        });
    });

    it('should pass responded metadata to callback', function(done) {
        register({}, serverUri + '/metadata', function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.deep.equal(metadata);
            done();
        });
    });

    it('should work with just a software statement', function(done) {
        register(statement, serverUri + '/echo', function(err, resp) {
            expect(err).to.be.not.ok;
            expect(resp).to.deep.equal({'software_statement': statement});
            done();
        });
    });

    describe('optional OAuth 2.0', function() {
        var token;

        before(function(done) {
            fs.readFile('./test/token', function(err, data) {
                if (err) { return done(err); }
                token = data.toString();
                done();
            });
        });

        it('should use OAuth 2.0 when given a token', function(done) {
            register({}, serverUri + '/oauth', function(err) {
                expect(err).to.be.not.ok;
                done();
            }, token);
        });

        it('should not use OAuth 2.0 when not given a token', function(done) {
            register({}, serverUri + '/oauth', function(err) {
                expect(err).to.be.ok;
                expect(err.status).to.equal(401);
                done();
            });
        });
    });

    describe('error handling', function() {
        it('should pass errors to callback', function(done) {
            register({}, serverUri, function(err) {
                expect(err).to.be.ok;
                done();
            });
        });

        describe('for client registration errors', function() {
            var regErr;

            before(function() {
                regErr = require('./registration_err.json');
            });

            it('should work with a description', function(done) {
                register({}, serverUri + '/error', function(err, resp) {
                    expect(err).to.be
                        .an.instanceOf(register.ClientRegistrationError);
                    expect(err.name).to.equal(regErr['error']);
                    expect(err.message).to.equal(regErr['error_description']);
                    expect(resp).to.be.not.ok;
                    done();
                });
            });

            it('should work without a description', function(done) {
                register({}, serverUri + '/error_only', function(err, resp) {
                    expect(err).to.be
                        .an.instanceOf(register.ClientRegistrationError);
                    expect(err.name).to.equal(regErr['error']);
                    expect(err.message).to.be.not.ok;
                    expect(resp).to.be.not.ok;
                    done();
                });
            });
        });
    });
});
