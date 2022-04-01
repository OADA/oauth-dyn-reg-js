# oauth-dyn-reg

[![npm](https://img.shields.io/npm/v/oauth-dyn-reg)](https://www.npmjs.com/package/oauth-dyn-reg)
[![Downloads/week](https://img.shields.io/npm/dw/oauth-dyn-reg.svg)](https://npmjs.org/package/oauth-dyn-reg)
[![Coverage Status](https://coveralls.io/repos/OADA/oauth-dyn-reg-js/badge.svg?branch=master)](https://coveralls.io/r/OADA/oauth-dyn-reg-js?branch=master)
[![Dependency Status](https://david-dm.org/oada/oauth-dyn-reg.svg)](https://david-dm.org/oada/oauth-dyn-reg)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://github.com/prettier/prettier)
[![License](https://img.shields.io/github/license/OADA/oauth-dyn-reg-js)](LICENSE)

This is an implementation of the
[draft OAuth 2.0 Dynamic Client Registration Protocol][rfc].

## Installation

```shell
yarn add oauth-dyn-reg
```

## Usage

```typescript
import register from 'oauth-dyn-reg';

const metadata = { /* See RFC section 2 for what goes here */ };
const registrationEndpoint = /* See RFC section 3 */;

// resp contains your client's registered metadata
const resp = await register(metadata, registrationEndpoint);
// !!!: resp may differ from metadata, the server MAY change values
```

An [OAuth 2.0 token][token] maybe optionally be given
after the callback parameter.

## References

1. [Draft OAuth 2.0 Dynamic Client Registration Protocol][rfc]
1. [OAuth 2.0 Authorization Framework][token]

[rfc]: https://datatracker.ietf.org/doc/html/rfc7591 'OAuth 2.0 Dynamic Client Registration Protocol'
[token]: http://tools.ietf.org/html/rfc6749#section-1.4 'OAuth 2.0 Tokens'
