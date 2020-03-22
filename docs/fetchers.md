# Fetchers

So, what is a fetcher? It's a connector between your API and your data. Connectors should tipically have the following methods/functions:

- `get()`: For get many APIs
- `getOne()`: For get one APIs
- `insertOne()`: For create one APIs
- `updateOne()`: For update one APIs

## Specification

The signature of this methods must be the following:

### `get({ filters, pageNumber, pageSize, sortBy, sortCriteria })`

- `filters` is an object with the following structure: `{ fieldName: { operator1: value1, operator2: value2 } }`.
- `pageNumber` and `pageSize` are both integers that indicate the size (by default 10) and the number (starting in page 1) intended to retrieve.
- `sortBy` and `sortCriteria` indicate the field to sort by and the criteria to use on that field (`asc` or `desc`)

### `getOne(id)`

- `id` is a string that identifies a unique record in your database

### `insertOne(record)`

- `record` is the object you want to store in your database

### `updateOne(id, record)`

- `id` is a string that identifies a unique record in your database
- `record` is the object you want to update in your database, for the record with that `id`

## Example

This is a very simple example of a basic fetcher of a mongodb based Pets database.

```js
// We assume db connections to be handled in some other file for simplicity
// Also filter parsing to mongo query object is omitted
const { mongodb, parseFiltersForMongo } = require('./mongodb');

const dbName = 'my-db';
const collectionName = 'pets';

module.exports = class PetsFetcher {

	get collection() {
		return mongodb
			.db(dbName)
			.collection(collectionName);
	}

	get({ filters, pageNumber, pageSize, sortBy, sortCriteria }) {
		return this.collection
			.find(parseFiltersForMongo(filters))
			.skip((pageNumber - 1) * pageSize)
			.limit(pageNumber * pageSize)
			.sort({ [sortBy]: sortCriteria === 'asc' : 1 : -1 })
			.toArray();
	}

	findOne(id) {
		return this.collection
			.findOne({ _id: id });
	}

	insertOne(record) {
		return this.collection
			.insertOne(record);
	}

	updateOne(id, record) {
		return this.collection
			.updateOne({ _id: id }, { $set: record });
	}

};
```
