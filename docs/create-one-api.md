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

This **required** getter must return a [Fetcher](fetchers.md) with at least the `insertOne()` method.

### `formatRecord(record)`

This optional method receives the record returned by the fetcher and must return the formatted record. It won't be called if record cannot be fetched.

### Others

You can also set the `headersValidator()` and `validate()` methods. `dataValidator()` method shouldn't be overriden, but in case you do so, be sure to call `super.dataValidator()` first.

## Example

This is a complete example of a Create one API:

```js
const {
	CreateOneApi,
	ApiHandler
} = require('aws-http-api-gateway');

const myFetcher = require('./my-fetcher');

class MyCreateOneApi extends CreateOneApi {

	get dataConnector() {
		return myFetcher;
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
