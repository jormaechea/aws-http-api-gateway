'use strict';

const sinon = require('sinon');
const assert = require('assert').strict;

const deepClone = require('lodash.clonedeep');

const {
	CreateOneApi,
	ConfigurationError
} = require('../../lib');

describe('Create One Api', () => {

	const sampleBody = {
		name: 'John'
	};

	const fullRequest = {
		body: JSON.stringify(sampleBody)
	};

	let dataConnector;

	class MyCreateOneApi extends CreateOneApi {
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

		it('Should reject if bodyValidator rejects', async () => {

			const rejection = new Error('dataConnector rejected');
			const bodyValidator = sinon.fake.rejects(rejection);

			class MyApiWithoutFailingValidation extends CreateOneApi {
				async bodyValidator(...args) {
					return bodyValidator(...args);
				}

				get dataConnector() {
					return {
						insertOne: () => Promise.resolve({})
					};
				}
			}

			const myApi = new MyApiWithoutFailingValidation(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), rejection);

			sinon.assert.calledOnce(bodyValidator);
			sinon.assert.calledWithExactly(bodyValidator, sampleBody);
		});

		it('Should reject with a ConfigurationError if dataConnector is not set', async () => {
			const myApi = new CreateOneApi(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if dataConnector has no insertOne property', async () => {

			class MyApiWithoutInsertOne extends CreateOneApi {
				get dataConnector() {
					return {};
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if dataConnector insertOne property is not a function', async () => {

			class MyApiWithoutInsertOne extends CreateOneApi {
				get dataConnector() {
					return {
						insertOne: 'invalidSetter'
					};
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject if dataConnector insertOne method rejects', async () => {

			const rejection = new Error('dataConnector rejected');

			class MyApiWithoutInsertOne extends CreateOneApi {
				get dataConnector() {
					return {
						insertOne: () => Promise.reject(rejection)
					};
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), rejection);
		});

		it('Should reject if record cannot be inserted', async () => {

			dataConnector = {
				insertOne: sinon.fake.resolves(false)
			};

			class MyApiWithoutInsertOne extends CreateOneApi {
				get dataConnector() {
					return dataConnector;
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));

			await assert.rejects(() => runApi(myApi));

			sinon.assert.calledOnce(dataConnector.insertOne);
		});

		it('Should reject if postSaveHook rejects', async () => {

			const rejection = new Error('postSaveHook rejected');

			dataConnector = {
				insertOne: sinon.fake.resolves(10)
			};

			class MyApiWithoutInsertOne extends CreateOneApi {
				get dataConnector() {
					return dataConnector;
				}

				async postSaveHook() {
					return Promise.reject(rejection);
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));

			await assert.rejects(() => runApi(myApi), rejection);
		});
	});

	describe('dataConnector params', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should pass the body to the dataConnector', async () => {

			dataConnector = {
				insertOne: sinon.fake.resolves(10)
			};

			const myApi = new MyCreateOneApi(deepClone(fullRequest));
			await runApi(myApi);

			sinon.assert.calledOnce(dataConnector.insertOne);
			sinon.assert.calledWithExactly(dataConnector.insertOne, sampleBody);
		});

		it('Should pass the formatted body to the dataConnector if formatRecord is set', async () => {

			class MyCreateOneApiWithFormat extends MyCreateOneApi {
				formatRecord(record) {
					return {
						...record,
						status: 'active'
					};
				}
			}

			dataConnector = {
				insertOne: sinon.fake.resolves(10)
			};

			const myApi = new MyCreateOneApiWithFormat({
				...deepClone(fullRequest),
				status: 'active'
			});
			await runApi(myApi);

			sinon.assert.calledOnce(dataConnector.insertOne);
			sinon.assert.calledWithExactly(dataConnector.insertOne, {
				...sampleBody,
				status: 'active'
			});
		});
	});

	describe('Formatting hooks', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should return the ID as it was inserted if no formatting hook is configured', async () => {

			dataConnector = {
				insertOne: sinon.fake.resolves(10)
			};

			const myApi = new MyCreateOneApi(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, {
				id: 10
			});

			sinon.assert.calledOnce(dataConnector.insertOne);
		});

		it('Should call the formatResponse hook once and return it\'s return value', async () => {

			class MyCreateOneApiWithHook extends MyCreateOneApi {
				async formatResponse({ id }) {
					return {
						id,
						test: true
					};
				}
			}

			sinon.spy(MyCreateOneApiWithHook.prototype, 'formatResponse');

			dataConnector = {
				insertOne: sinon.fake.resolves(10)
			};

			const myApi = new MyCreateOneApiWithHook(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, {
				id: 10,
				test: true
			});

			sinon.assert.calledOnce(dataConnector.insertOne);

			sinon.assert.calledOnce(MyCreateOneApiWithHook.prototype.formatResponse);
			sinon.assert.calledWithExactly(MyCreateOneApiWithHook.prototype.formatResponse, { id: 10 });
		});
	});

	describe('Post save hook', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should call the postSaveHook hook once after saving the record', async () => {

			const postSaveHook = sinon.fake.resolves();

			class MyCreateOneApiWithHook extends MyCreateOneApi {
				async postSaveHook(...args) {
					return postSaveHook(...args);
				}
			}

			dataConnector = {
				insertOne: sinon.fake.resolves(10)
			};

			const myApi = new MyCreateOneApiWithHook(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, {
				id: 10
			});

			sinon.assert.calledOnce(dataConnector.insertOne);

			sinon.assert.calledOnce(postSaveHook);
			sinon.assert.calledWithExactly(postSaveHook, 10);
		});
	});

});
