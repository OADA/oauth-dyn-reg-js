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

import type {} from 'cross-fetch';

// @ts-expect-error only needed for types
import type Metadata from '@oada/types/oauth-dyn-reg/metadata.js';
// @ts-expect-error only needed for types
import type RegistrationData from '@oada/types/oauth-dyn-reg/response.js';

export class ClientRegistrationError extends Error {
  readonly response;
  constructor(response: Response, error: string, description?: string) {
    super(description);
    this.name = error;
    this.response = response;
  }
}

export interface Options {
  metadata: Metadata | string;
  endpoint: string | URL;
  token?: string;
  fetch?: typeof fetch;
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
export async function register({
  metadata,
  endpoint,
  token,
  fetch = globalThis.fetch,
}: Options): Promise<RegistrationData> {
  const parameters =
    typeof metadata === 'object'
      ? metadata
      : { software_statement: `${metadata}` };
  const body = JSON.stringify(parameters);
  const headers = new Headers({
    'Content-Type': 'application/json',
    'Content-Length': `${body.length}`,
    'Accept': 'application/json',
  });

  if (token) {
    headers.append('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body,
  });
  if (!response.ok) {
    /**
     * @see {@link https://datatracker.ietf.org/doc/html/rfc7591#section-3.2.2}
     */
    if (response.status === 400) {
      const { error, error_description } = await response.json();
      throw new ClientRegistrationError(response, error, error_description);
    }

    throw new ClientRegistrationError(
      response,
      `${response.status}: ${response.statusText}`
    );
  }

  return response.json();
}
