[![Build Status](https://travis-ci.org/OADA/oauth-dyn-reg-js.svg?branch=master)](https://travis-ci.org/OADA/oauth-dyn-reg-js)
[![Coverage Status](https://coveralls.io/repos/OADA/oauth-dyn-reg-js/badge.svg?branch=master)](https://coveralls.io/r/OADA/oauth-dyn-reg-js?branch=master)
[![Dependency Status](https://david-dm.org/oada/oauth-dyn-reg-js.svg)](https://david-dm.org/oada/oauth-dyn-reg-js)
[![License](http://img.shields.io/:license-Apache%202.0-green.svg)](http://www.apache.org/licenses/LICENSE-2.0.html)

# oauth-dyn-reg #
This is an implementation of the
[draft OAuth 2.0 Dynamic Client Registration Protocol][RFC].

## Installation ##
```shell
npm install oauth-dyn-reg
```

## Usage ##
```javascript
var register = require('oauth-dyn-reg');

var metadata = { /* See RFC section 2 for what goes here */ };
var registrationEndpoint = /* See RFC section 3 */;

register(metadata, registrationEndpoint, function callback(err, resp) {
    if (!err) {
        // resp contains your client's registered metadata
        // NOTE: resp may differ from metadata, the server MAY change values
    }
});
```

An [OAuth 2.0 token][token] maybe optionally be given
after the callback parameter.

## References ##
1. [Draft OAuth 2.0 Dynamic Client Registration Protocol][RFC]
1. [OAuth 2.0 Authorization Framework][Token]

[RFC]: https://tools.ietf.org/html/draft-ietf-oauth-dyn-reg "Draft OAuth 2.0 Dynamic Client Registration Protocol"
[token]: http://tools.ietf.org/html/rfc6749#section-1.4 "OAuth 2.0 Tokens"
