'use strict';

const sinon = require('sinon');
const assert = require('assert').strict;

const deepClone = require('lodash.clonedeep');

const {
	GetManyApi,
	SortError,
	ConfigurationError
} = require('../../lib');

describe('Get Many Api', () => {

	const fullRequest = {
		queryStringParameters: {
			sortBy: 'name',
			sortCriteria: 'desc',
			page: 2,
			pageSize: 20,
			'filters[foo]': 'bar'
		}
	};

	let fetcher;

	class MyGetManyApi extends GetManyApi {
		get fetcher() {
			return fetcher;
		}
	}

	const runApi = async api => {
		if(api.dataValidator)
			await api.dataValidator();
		if(api.headersValidator)
			await api.headersValidator();
		if(api.validate)
			await api.validate();
		if(api.process)
			await api.process();
		return api.response;
	};

	describe('Errors', () => {

		it('Should reject with a ConfigurationError if fetcher is not set', async () => {
			const myApi = new GetManyApi({});
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if fetcher has no get property', async () => {

			class MyApiWithoutGet extends GetManyApi {
				get fetcher() {
					return {};
				}
			}

			const myApi = new MyApiWithoutGet({});
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if fetcher get property is not a function', async () => {

			class MyApiWithoutGet extends GetManyApi {
				get fetcher() {
					return {
						get: 'invalidGetter'
					};
				}
			}

			const myApi = new MyApiWithoutGet({});
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject if fetcher get method rejects', async () => {

			const rejection = new Error('Fetcher rejected');

			class MyApiWithoutGet extends GetManyApi {
				get fetcher() {
					return {
						get: () => Promise.reject(rejection)
					};
				}
			}

			const myApi = new MyApiWithoutGet({});
			await assert.rejects(() => runApi(myApi), rejection);
		});

		it('Should reject if a sort param is sent and no sortable fields are defined', async () => {

			class MyApiWithoutCustomization extends GetManyApi {
				get fetcher() {
					return {
						get: () => Promise.resolve([])
					};
				}
			}

			const myApi = new MyApiWithoutCustomization({
				queryStringParameters: {
					sortBy: 'invalidField'
				}
			});
			await assert.rejects(() => runApi(myApi), SortError);
		});
	});

	describe('Fetcher params', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should pass first page, empty filters and no sort params by default', async () => {

			class MyFilterableGetManyApi extends MyGetManyApi {

				get filtersDefinition() {
					return ['foo'];
				}
			}

			fetcher = {
				get: sinon.fake.resolves([])
			};

			const myApi = new MyFilterableGetManyApi({});
			await runApi(myApi);

			sinon.assert.calledOnce(fetcher.get);
			sinon.assert.calledWithExactly(fetcher.get, {
				filters: {},
				pageNumber: 1,
				pageSize: 10
			});
		});

		it('Should pass all parsed params if they are defined', async () => {

			class MyFullGetManyApi extends MyGetManyApi {

				get filtersDefinition() {
					return ['foo'];
				}

				get sortableFields() {
					return ['name'];
				}
			}

			fetcher = {
				get: sinon.fake.resolves([])
			};

			const myApi = new MyFullGetManyApi(deepClone(fullRequest));
			await runApi(myApi);

			sinon.assert.calledOnce(fetcher.get);
			sinon.assert.calledWithExactly(fetcher.get, {
				filters: {
					foo: {
						equal: 'bar'
					}
				},
				pageNumber: 2,
				pageSize: 20,
				sortBy: 'name',
				sortCriteria: 'desc'
			});
		});
	});

	describe('Formatting hooks', () => {

		afterEach(() => {
			sinon.restore();
		});

		const sampleRecords = [
			{ id: 1, name: 'John' },
			{ id: 2, name: 'Matt' }
		];

		it('Should return the records as they were fetched if no formatting hook is configured', async () => {

			fetcher = {
				get: sinon.fake.resolves(deepClone(sampleRecords))
			};

			const myApi = new MyGetManyApi({});
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, sampleRecords);

			sinon.assert.calledOnce(fetcher.get);
		});

		it('Should call the formatRecords hook once with all the records and return it\'s return value', async () => {

			class MyGetManyApiWithHook extends MyGetManyApi {
				async formatRecords(records) {
					return records.map(({ id }) => id);
				}
			}

			sinon.spy(MyGetManyApiWithHook.prototype, 'formatRecords');

			fetcher = {
				get: sinon.fake.resolves(deepClone(sampleRecords))
			};

			const myApi = new MyGetManyApiWithHook({});
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, [1, 2]);

			sinon.assert.calledOnce(fetcher.get);

			sinon.assert.calledOnce(MyGetManyApiWithHook.prototype.formatRecords);
			sinon.assert.calledWithExactly(MyGetManyApiWithHook.prototype.formatRecords, sampleRecords);
		});

		it('Should call the formatRecord hook once for each record and return an array of return values', async () => {

			class MyGetManyApiWithHook extends MyGetManyApi {
				async formatRecord({ id }) {
					return id;
				}
			}

			sinon.spy(MyGetManyApiWithHook.prototype, 'formatRecord');

			fetcher = {
				get: sinon.fake.resolves(deepClone(sampleRecords))
			};

			const myApi = new MyGetManyApiWithHook({});
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, [1, 2]);

			sinon.assert.calledOnce(fetcher.get);

			sinon.assert.calledTwice(MyGetManyApiWithHook.prototype.formatRecord);
			sinon.assert.calledWithExactly(MyGetManyApiWithHook.prototype.formatRecord.getCall(0), sampleRecords[0]);
			sinon.assert.calledWithExactly(MyGetManyApiWithHook.prototype.formatRecord.getCall(1), sampleRecords[1]);
		});

		it('Should call formatRecords and then formatRecord and return the final result', async () => {

			class MyGetManyApiWithHooks extends MyGetManyApi {
				async formatRecords(records) {
					return records.map(({ id }) => id);
				}

				async formatRecord(id) {
					return `The ID is ${id}`;
				}
			}

			sinon.spy(MyGetManyApiWithHooks.prototype, 'formatRecords');
			sinon.spy(MyGetManyApiWithHooks.prototype, 'formatRecord');

			fetcher = {
				get: sinon.fake.resolves(deepClone(sampleRecords))
			};

			const myApi = new MyGetManyApiWithHooks({});
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, ['The ID is 1', 'The ID is 2']);

			sinon.assert.calledOnce(fetcher.get);

			sinon.assert.calledOnce(MyGetManyApiWithHooks.prototype.formatRecords);
			sinon.assert.calledWithExactly(MyGetManyApiWithHooks.prototype.formatRecords, sampleRecords);

			sinon.assert.calledTwice(MyGetManyApiWithHooks.prototype.formatRecord);
			sinon.assert.calledWithExactly(MyGetManyApiWithHooks.prototype.formatRecord.getCall(0), 1);
			sinon.assert.calledWithExactly(MyGetManyApiWithHooks.prototype.formatRecord.getCall(1), 2);
		});
	});

});
