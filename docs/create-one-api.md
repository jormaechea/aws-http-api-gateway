# Create One Api

This API is intended to create one record. The record ID must be auto-generated.

This API should return an error if a duplicated record is trying to be created.

## Specification

This API is based in 5 getters/methods to customize your API:

- `bodyValidator(body)`
- `get dataConnector()`
- `formatRecord(record)`
- `postSaveHook(id, formattedRecord)`
- `formatResponseBody(responseBody)`

Each one of this methods has an specific role in order to have standarized APIs:

### `bodyValidator(body)`

This optional method receives the body as an argument and should throw if it's invalid

### `get dataConnector()`

This **required** getter must return a [Connector](connectors.md) with at least the `insertOne()` method.

### `formatRecord(record)`

This optional method receives the record received as the request body and must return the formatted record.

### `postSaveHook(id, formattedRecord)`

This optional method receives the id and the record (formatted if `formatRecord()` method is set), and may be used to notify about the creation, updating some cache, or whatever you want.

### `formatResponseBody(responseBody)`

This optional method receives the default response body (an object like this: `{ id }`), and must return the new response body.

### Others

You can also set the `headersValidator()` and `validate()` methods. `dataValidator()` method shouldn't be overriden, but in case you do so, be sure to call `super.dataValidator()` first.

## Example

This is a complete example of a Create one API:

```js
const {
	CreateOneApi,
	ApiHandler
} = require('aws-http-api-gateway');

const myConnector = require('./my-connector');

class MyCreateOneApi extends CreateOneApi {

	get dataConnector() {
		return myConnector;
	}

	bodyValidator(body) {
		if(!body.name)
			throw new Error('Missing required property name');
	}

	formatRecord(record) {
		return {
			...record,
			creationDate: new Date()
		};
	}

	postSaveHook(id, record) {
		console.log(`Record was created with id ${id} and content: ${JSON.stringify(record)}`);
	}

	formatResponseBody(responseBody) {
		return {
			...responseBody,
			responseTimestamp: Date.now()
		}
	}

};

module.exports.handler = ApiHandler(MyCreateOneApi);
```
