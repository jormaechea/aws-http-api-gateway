'use strict';

const sinon = require('sinon');
const assert = require('assert').strict;

const deepClone = require('lodash.clonedeep');

const {
	GetOneApi,
	ConfigurationError
} = require('../../lib');

describe('Get One Api', () => {

	const fullRequest = {
		pathParameters: {
			id: 10
		}
	};

	let dataConnector;

	class MyGetOneApi extends GetOneApi {
		get dataConnector() {
			return dataConnector;
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

		it('Should reject if pathParameters is not set', async () => {

			class MyApiWithoutGetOne extends GetOneApi {
				get dataConnector() {
					return {
						getOne: () => Promise.resolve({})
					};
				}
			}

			const myApi = new MyApiWithoutGetOne({});
			await assert.rejects(() => runApi(myApi));
		});

		it('Should reject if pathParameters.id is not set', async () => {

			class MyApiWithoutGetOne extends GetOneApi {
				get dataConnector() {
					return {
						getOne: () => Promise.resolve({})
					};
				}
			}

			const myApi = new MyApiWithoutGetOne({
				pathParameters: {}
			});
			await assert.rejects(() => runApi(myApi));
		});

		it('Should reject with a ConfigurationError if dataConnector is not set', async () => {
			const myApi = new GetOneApi(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if dataConnector has no getOne property', async () => {

			class MyApiWithoutGetOne extends GetOneApi {
				get dataConnector() {
					return {};
				}
			}

			const myApi = new MyApiWithoutGetOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if dataConnector getOne property is not a function', async () => {

			class MyApiWithoutGetOne extends GetOneApi {
				get dataConnector() {
					return {
						getOne: 'invalidGetter'
					};
				}
			}

			const myApi = new MyApiWithoutGetOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject if dataConnector getOne method rejects', async () => {

			const rejection = new Error('dataConnector rejected');

			class MyApiWithoutGetOne extends GetOneApi {
				get dataConnector() {
					return {
						getOne: () => Promise.reject(rejection)
					};
				}
			}

			const myApi = new MyApiWithoutGetOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), rejection);
		});

		it('Should set a status code 404 and reject if no record is fetched', async () => {

			class MyApiWithoutGetOne extends GetOneApi {
				get dataConnector() {
					return {
						getOne: () => Promise.resolve()
					};
				}
			}

			const myApi = new MyApiWithoutGetOne(deepClone(fullRequest));

			await assert.rejects(() => runApi(myApi));
			assert.deepStrictEqual(myApi.statusCode, 404);
		});
	});

	describe('dataConnector params', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should pass the ID from pathParameters to the dataConnector', async () => {

			dataConnector = {
				getOne: sinon.fake.resolves([])
			};

			const myApi = new MyGetOneApi(deepClone(fullRequest));
			await runApi(myApi);

			sinon.assert.calledOnce(dataConnector.getOne);
			sinon.assert.calledWithExactly(dataConnector.getOne, 10);
		});
	});

	describe('Formatting hooks', () => {

		afterEach(() => {
			sinon.restore();
		});

		const sampleRecord = { id: 10, name: 'John' };

		it('Should return the record as it was fetched if no formatting hook is configured', async () => {

			dataConnector = {
				getOne: sinon.fake.resolves(deepClone(sampleRecord))
			};

			const myApi = new MyGetOneApi(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, sampleRecord);

			sinon.assert.calledOnce(dataConnector.getOne);
		});

		it('Should call the formatRecord hook once return it\'s return value', async () => {

			class MyGetOneApiWithHook extends MyGetOneApi {
				async formatRecord({ id }) {
					return id;
				}
			}

			sinon.spy(MyGetOneApiWithHook.prototype, 'formatRecord');

			dataConnector = {
				getOne: sinon.fake.resolves(deepClone(sampleRecord))
			};

			const myApi = new MyGetOneApiWithHook(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, 10);

			sinon.assert.calledOnce(dataConnector.getOne);

			sinon.assert.calledOnce(MyGetOneApiWithHook.prototype.formatRecord);
			sinon.assert.calledWithExactly(MyGetOneApiWithHook.prototype.formatRecord, sampleRecord);
		});
	});

});
