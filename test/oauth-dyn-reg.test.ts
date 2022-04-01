/**
 * @license
 * Copyright 2015-2022 Open Ag Data Alliance
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

/* eslint-env mocha */
/* eslint-disable @typescript-eslint/no-unused-expressions */

import { expect } from 'chai';
import nock from 'nock';

import register, { ClientRegistrationError } from '../src';

const serverUri = 'https://identity.oada-dev.com';
let server: nock.Scope;

describe('oauth-dyn-reg', () => {
  beforeEach(() => {
    server = nock(serverUri);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should POST client metadata', async () => {
    const endpoint = '/register';
    const metadata = {
      a: 1,
      b: 2,
      c: 'a',
    };

    server.post(endpoint, metadata).once().reply(200);

    const resp = await register(metadata, serverUri + endpoint);
    expect(resp).to.be.ok;
  });

  it('should POST with Content-Type application/json', async () => {
    const endpoint = '/register';

    server
      .matchHeader('Content-Type', 'application/json')
      .post(endpoint)
      .once()
      .reply(200);

    const resp = await register({}, serverUri + endpoint);
    expect(resp).to.be.ok;
  });

  it('should accept application/json', async () => {
    const endpoint = '/register';

    server
      .matchHeader('Accept', 'application/json')
      .post(endpoint)
      .once()
      .reply(200);

    const resp = await register({}, serverUri + endpoint);
    expect(resp).to.be.ok;
  });

  it('should pass responded metadata to callback', async () => {
    const endpoint = '/register';
    const metadata = {
      a: 1,
      b: 2,
      c: 'a',
    };

    server.post(endpoint).once().reply(200, metadata);

    const resp = await register({}, serverUri + endpoint);
    expect(resp).to.deep.equal(metadata);
  });

  it('should work with just a software statement', async () => {
    const endpoint = '/register';
    const softwareStatement = 'FOOBAR32';

    server
      .post(endpoint, { software_statement: softwareStatement })
      .once()
      .reply(200);

    const resp = await register(softwareStatement, serverUri + endpoint);
    expect(resp).to.be.ok;
  });

  describe('optional OAuth 2.0', () => {
    const token = 'DEAD BEEF';

    it('should use OAuth 2.0 when given a token', async () => {
      const endpoint = '/register_oauth';

      server
        .matchHeader('Authorization', token)
        .post(endpoint)
        .once()
        .reply(200);

      const resp = await register({}, serverUri + endpoint, token);
      expect(resp).to.be.ok;
    });

    it('should not use OAuth 2.0 when not given a token', async () => {
      const endpoint = '/register';

      server
        .matchHeader('Authorization', (value) => value === undefined)
        .post(endpoint)
        .once()
        .reply(200);

      const resp = await register({}, serverUri + endpoint);
      expect(resp).to.be.ok;
    });
  });

  describe('error handling', () => {
    it('should pass errors to callback', async () => {
      try {
        await register(
          {},
          // @ts-expect-error type intentionally wrong
          server
        );
      } catch (error: unknown) {
        expect(error).to.be.ok;
        return;
      }

      expect.fail();
    });

    describe('for client registration errors', () => {
      it('should work with a description', async () => {
        const endpoint = '/register';
        const error = {
          error: 'invalid_client_metadata',
          error_description:
            "The grant type 'authorization_code' must be" +
            " registered along with the response type 'code'" +
            " but found only 'implicit' instead.",
        };

        server.post(endpoint).once().reply(400, error);

        try {
          await register({}, serverUri + endpoint);
        } catch (cError: unknown) {
          expect(cError).to.be.an.instanceOf(ClientRegistrationError);
          expect((cError as ClientRegistrationError).name).to.equal(
            error.error
          );
          expect((cError as ClientRegistrationError).message).to.equal(
            error.error_description
          );
          return;
        }

        expect.fail();
      });

      it('should work without a description', async () => {
        const endpoint = '/register';
        const error = {
          error: 'invalid_client_metadata',
        };

        server.post(endpoint).once().reply(400, error);

        try {
          await register({}, serverUri + endpoint);
        } catch (cError: unknown) {
          expect(cError).to.be.an.instanceOf(ClientRegistrationError);
          expect((cError as ClientRegistrationError).name).to.equal(
            error.error
          );
          expect((cError as ClientRegistrationError).message).to.equal('');
          return;
        }

        expect.fail();
      });
    });

    it('should return JSON response body with HTTP errors', async () => {
      const endpoint = '/register';
      const json = {
        foo: 'bar',
        a: 'b',
      };

      server.post(endpoint).once().reply(401, json);

      try {
        await register({}, serverUri + endpoint);
      } catch (error: unknown) {
        expect(error).to.not.be.an.instanceOf(ClientRegistrationError);
        // @ts-expect-error stuff
        expect(error.response.body).to.deep.equal(json);
        return;
      }

      expect.fail();
    });
  });
});
