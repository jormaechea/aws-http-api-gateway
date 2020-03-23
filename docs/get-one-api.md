# Get One Api

This API is intended to fetch an specific record by it's ID. **IMPORTANT** API definition must set a path parameter `{id}`.

This API will set a 404 HTTP status code if record does not exist.

## Specification

This API is based in 2 getters/methods to customize your API:

- `get dataConnector()`
- `formatRecord(record)`

Each one of this methods has an specific role in order to have standarized APIs:

### `get dataConnector()`

This **required** getter must return a [Fetcher](fetchers.md) with at least the `getOne()` method.

### `formatRecord(record)`

This optional method receives the record returned by the fetcher and must return the formatted record. It won't be called if record cannot be fetched.

## Example

This is a complete example of a Get one API:

```js
const {
	GetOneApi,
	ApiHandler
} = require('aws-http-api-gateway');

const myFetcher = require('./my-fetcher');

class MyGetOneApi extends GetOneApi {

	get dataConnector() {
		return myFetcher;
	}

	formatRecord({ password, ...record }) {
		return record;
	}

};

module.exports.handler = ApiHandler(MyGetOneApi);
```