# Get Many Api

This API is intended to fetch a list of records, allowing to filter, sort and paginate them.

## Specification

This API is based in 5 getters/methods to customize your API:

- `get filtersDefinition()`
- `get sortableFields()`
- `get dataConnector()`
- `formatRecords(records)`
- `formatRecord(record)`

Each one of this methods has an specific role in order to have standarized APIs:

### `get filtersDefinition()`

This optional getter defines which filters are considered valid. Request filters should be defined as a query string like the followings:

- `filters[name]=John`
- `filters[status][0]=active&filters[status][1]=inactive`

The filters definition is an array of any of the following structures:

1. `string`: This represents a filter with the given name, and no other properties set.
2. `object<name, valueMapper, internalName, operator>`: Where the properties are as follow:

- `name`: The name of the filter that should be sent in query string. **Required**
- `valueMapper`: A function with the signature `initialValue => mappedValue` to transform the filter value if needed
- `internalName`: `string` being the name of the field to use to fetch the records, or `function` with the signature `(name, initialValue, mappedValue) => string` to generate a dynamic internalName for each request.
- `operator`: The operator to be used to filter the records. All operators are exported in `helpers.Filter.operators`. Default operator is `helpers.Filter.operators.equal`

### `get sortableFields()`

This optional getter should return an array of the allowed fields to sort by.

### `get dataConnector()`

This **required** getter must return a [Fetcher](fetchers.md) with at least the `get()` method.

### `formatRecords(records)`

This optional method receives the array of records returned by the fetcher and must return a new array with the formatted records.

### `formatRecord(record)`

This optional method, if defined, will be called once for each record. It must return the formatted record for each call.

## Example

This is a complete example of a Get many API:

```js
const {
	GetManyApi,
	ApiHandler,
	helpers: {
		Filter
	}
} = require('aws-http-api-gateway');

const myFetcher = require('./my-fetcher');

class MyGetManyApi extends GetManyApi {

	get dataConnector() {
		return myFetcher;
	}

	get filtersDefinition() {
		return [
			'id',
			{
				name: 'name',
				internalName: 'firstName'
			},
			{
				name: 'olderThan',
				internalName: 'age',
				valueMapper: Number,
				operator: Filter.operators.greater
			},
			{
				name: 'quantityIsPositive',
				internalName: value => `quantity.${value}`,
				valueMapper: () => 0,
				operator: Filter.operators.greater
			}
		];
	}

	get sortableFields() {
		return ['name', 'age'];
	}

	formatRecords(records) {
		return records.map(record => ({
			...record,
			isAdult: record.age >= 18
		}));
	}

	formatRecord({ password, record }) {
		return record;
	}

};

module.exports.handler = ApiHandler(MyGetManyApi);
```
