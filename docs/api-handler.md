# Api Handler

The API handler is the connector between your APIs and AWS HTTP APIs. It's a currified function with the following signature:

```js
ApiHandler = Api => async event => ApiResponse;
```

## Specification

To use de API handler, you must call it once passing your API as an argument, and it will return a lambda handler async function.

It will all be handled automatically afterwards.

## Example

This is a complete example of a API Handler implemented:

```js
const { ApiHandler } = require('aws-http-api-gateway');

const SomeApi = require('./some-api');

module.exports.handler = ApiHandler(SomeApi);
```
