# Generic Api

While this is not the Api that you'll extend from more often, it's super important as it's the base of every well-known API you will implement.

## Specification

This API is based in 4 getters/methods that are executed in the following order by the [API Handler](api-handler.md):

- `async dataValidator()`
- `async headersValidator()`
- `async validate()`
- `async process()`

Each one of this methods has an specific role in order to have standarized APIs:

### `dataValidator()`

This method shall be used to validate the request data (body or query string). It shouldn't have any side effects, just validate data types and value constraints.

If something is not valid, you should simply throw an error.

### `headersValidator()`

This method shall be used to validate the request headers. It shouldn't have any side effects, just validate headers existance and value constraints.

If something is not valid, you should simply throw an error.

### `validate()`

This method is where you can make your DB queries to validate, for example, if a record exists, or if a related record is active, etc.

If something is not valid, you should simply throw an error.

### `process()`

At this point, everything in the request is valid. Here you should simply make what your API needs to get done.

This is the only required method of your API.

If something goes wrong, you should simply throw an error.

## Getters and setters

In order to interact with the request and response, you have a series of getters and methods:

### Request

`get pathParameters`:  Returns an object of key-values from the path variables

`get rawHeaders`:  Returns the headers as they arrived

`get headers`: Returns the headers, mapping the names to lower case

`get qs`: Returns the query string as an object

`get body`: Returns the request body

`get authorizerClaims`: Returns the object of the JWT authorizer claims (if an authorizer was configured)

`get authorizerScopes`: Returns the scopes array of the JWT authorizer claims (if an authorizer was configured)

### Response

`setHeaders(headers)`: Sets response headers.

`setStatusCode(statusCode)`: Sets response HTTP status code

`setBody(body)`: Sets response body

`get statusCode()`: Returns the status code (or `undefined` if it has not been set yet)

`get respose()`: Returns the response object with the following properties: `body`, `statusCode` (default `200`) and `headers`.

By default, two response headers are set:

- `content-type: application/json`
- `x-powered-by: aws-http-api-gateway`

## Example

This is a complete example of a generic API:

```js
const { Api, ApiHandler } = require('aws-http-api-gateway');

const myConnector = require('./my-connector');

class MyApi extends Api {

	dataValidator() {
		if(!this.data.someRequiredProperty)
			throw new Error('Missing required property someRequiredProperty');
	}

	headersValidator() {
		if(!this.headers['x-some-header'])
			throw new Error('Missing required header x-some-header');
	}

	async validate() {
		const someDependency = await myConnector.getOne(this.pathParameters.id);

		if(!someDependency)
			throw new Error(`Dependency with id ${this.pathParameters.id} does not exist`);
	}

	async process() {
		const updated = await myConnector.updateOne(this.pathParameters.id, {
			...this.data,
			status: 'active'
		});

		if(!updated)
			throw new Error('Internal error');

		this.setBody({ id: this.pathParameters.id });
	}

};

module.exports.handler = ApiHandler(MyApi);
```
