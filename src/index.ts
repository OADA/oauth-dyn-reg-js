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

import request, { HTTPError, ResponseError } from 'superagent';

import type Metadata from '@oada/types/oauth-dyn-reg/metadata.js';
import type RegistrationData from '@oada/types/oauth-dyn-reg/response.js';

export class ClientRegistrationError extends Error {
  readonly response;
  constructor(error: ResponseError) {
    super(error.response?.body.error_description);
    this.name = `${error.response?.body?.error ?? error.name}`;
    this.response = error.response;
  }
}

/**
 * Perform OAuth 2.0 Dynamic Client Registration as per
 * {@link https://datatracker.ietf.org/doc/html/rfc7591 RFC 7591}
 *
 *
 * @param metadata
 * Object of {@link https://datatracker.ietf.org/doc/html/rfc7591#section-2 Client Metadata}
 * or a string of a signed JWT
 * {@link https://datatracker.ietf.org/doc/html/rfc7591#section-2.3 Software Statement}
 *
 * @param endpoint
 * API endpoint for the associated OAuth 2.0 requests
 *
 * @param token
 * Optional OAuth 2.0 token if required by the registration endpoint
 *
 * @returns Promise of final metadata (**_may_ differ from `metadata` input**)
 * @see
 * {@link https://datatracker.ietf.org/doc/html/rfc7591#section-3.2.1 Client Information Response }
 * for further details.
 */
export default async function register(
  metadata: Metadata | string,
  endpoint: string,
  token?: string
) {
  const parameters =
    typeof metadata === 'object'
      ? metadata
      : { software_statement: `${metadata}` };

  const registration = request
    .post(endpoint)
    .type('application/json')
    .accept('application/json')
    .send(parameters);

  if (token) {
    void registration.set('Authorization', token);
  }

  if (typeof registration.buffer === 'function') {
    void registration.buffer(); /* Browser */
  }

  try {
    const resp = await registration;
    return resp?.body as RegistrationData;
  } catch (error: unknown) {
    // Handle registration errors as defined in RFC
    if (isResponseError(error)) {
      if (error.status === 400) {
        throw new ClientRegistrationError(error);
      }

      throw error as HTTPError;
    }

    // Otherwise just pass the error up?
    throw error;
  }
}

function isResponseError(error: unknown): error is ResponseError {
  return error instanceof Error && 'status' in error && 'response' in error;
}
