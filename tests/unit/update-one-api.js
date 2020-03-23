'use strict';

const sinon = require('sinon');
const assert = require('assert').strict;

const deepClone = require('lodash.clonedeep');

const {
	UpdateOneApi,
	ConfigurationError
} = require('../../lib');

describe('Update One Api', () => {

	const sampleBody = {
		name: 'John'
	};

	const fullRequest = {
		pathParameters: {
			id: 10
		},
		body: JSON.stringify(sampleBody)
	};

	let dataConnector;

	class MyUpdateOneApi extends UpdateOneApi {
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

			class MyApiWithoutUpdateOne extends UpdateOneApi {
				get dataConnector() {
					return {
						updateOne: () => Promise.resolve({})
					};
				}
			}

			const myApi = new MyApiWithoutUpdateOne({});
			await assert.rejects(() => runApi(myApi));
		});

		it('Should reject if pathParameters.id is not set', async () => {

			class MyApiWithoutUpdateOne extends UpdateOneApi {
				get dataConnector() {
					return {
						updateOne: () => Promise.resolve({})
					};
				}
			}

			const myApi = new MyApiWithoutUpdateOne({
				pathParameters: {}
			});
			await assert.rejects(() => runApi(myApi));
		});

		it('Should reject if bodyValidator rejects', async () => {

			const rejection = new Error('dataConnector rejected');
			const bodyValidator = sinon.fake.rejects(rejection);

			class MyApiWithoutFailingValidation extends UpdateOneApi {
				async bodyValidator(...args) {
					return bodyValidator(...args);
				}

				get dataConnector() {
					return {
						updateOne: () => Promise.resolve({})
					};
				}
			}

			const myApi = new MyApiWithoutFailingValidation(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), rejection);

			sinon.assert.calledOnce(bodyValidator);
			sinon.assert.calledWithExactly(bodyValidator, sampleBody);
		});

		it('Should reject with a ConfigurationError if dataConnector is not set', async () => {
			const myApi = new UpdateOneApi(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if dataConnector has no updateOne property', async () => {

			class MyApiWithoutInsertOne extends UpdateOneApi {
				get dataConnector() {
					return {};
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject with a ConfigurationError if dataConnector updateOne property is not a function', async () => {

			class MyApiWithoutInsertOne extends UpdateOneApi {
				get dataConnector() {
					return {
						updateOne: 'invalidSetter'
					};
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), ConfigurationError);
		});

		it('Should reject if dataConnector updateOne method rejects', async () => {

			const rejection = new Error('dataConnector rejected');

			class MyApiWithoutInsertOne extends UpdateOneApi {
				get dataConnector() {
					return {
						updateOne: () => Promise.reject(rejection)
					};
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));
			await assert.rejects(() => runApi(myApi), rejection);
		});

		it('Should reject if record cannot be updated', async () => {

			dataConnector = {
				updateOne: sinon.fake.resolves(0)
			};

			class MyApiWithoutInsertOne extends UpdateOneApi {
				get dataConnector() {
					return dataConnector;
				}
			}

			const myApi = new MyApiWithoutInsertOne(deepClone(fullRequest));

			await assert.rejects(() => runApi(myApi));

			sinon.assert.calledOnce(dataConnector.updateOne);
		});

		it('Should reject if postSaveHook rejects', async () => {

			const rejection = new Error('postSaveHook rejected');

			dataConnector = {
				updateOne: sinon.fake.resolves(1)
			};

			class MyApiWithoutInsertOne extends UpdateOneApi {
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
				updateOne: sinon.fake.resolves(1)
			};

			const myApi = new MyUpdateOneApi(deepClone(fullRequest));
			await runApi(myApi);

			sinon.assert.calledOnce(dataConnector.updateOne);
			sinon.assert.calledWithExactly(dataConnector.updateOne, 10, sampleBody);
		});

		it('Should pass the formatted body to the dataConnector if formatRecord is set', async () => {

			class MyUpdateOneApiWithFormat extends MyUpdateOneApi {
				formatRecord(record) {
					return {
						...record,
						status: 'active'
					};
				}
			}

			dataConnector = {
				updateOne: sinon.fake.resolves(1)
			};

			const myApi = new MyUpdateOneApiWithFormat({
				...deepClone(fullRequest),
				status: 'active'
			});
			await runApi(myApi);

			sinon.assert.calledOnce(dataConnector.updateOne);
			sinon.assert.calledWithExactly(dataConnector.updateOne, 10, {
				...sampleBody,
				status: 'active'
			});
		});
	});

	describe('Formatting hooks', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should return the ID as it was updated if no formatting hook is configured', async () => {

			dataConnector = {
				updateOne: sinon.fake.resolves(1)
			};

			const myApi = new MyUpdateOneApi(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, JSON.stringify({
				id: 10
			}));

			sinon.assert.calledOnce(dataConnector.updateOne);
		});

		it('Should call the formatResponseBody hook once and return it\'s return value', async () => {

			class MyUpdateOneApiWithHook extends MyUpdateOneApi {
				async formatResponseBody({ id }) {
					return {
						id,
						test: true
					};
				}
			}

			sinon.spy(MyUpdateOneApiWithHook.prototype, 'formatResponseBody');

			dataConnector = {
				updateOne: sinon.fake.resolves(1)
			};

			const myApi = new MyUpdateOneApiWithHook(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, JSON.stringify({
				id: 10,
				test: true
			}));

			sinon.assert.calledOnce(dataConnector.updateOne);

			sinon.assert.calledOnce(MyUpdateOneApiWithHook.prototype.formatResponseBody);
			sinon.assert.calledWithExactly(MyUpdateOneApiWithHook.prototype.formatResponseBody, { id: 10 });
		});
	});

	describe('Post save hook', () => {

		afterEach(() => {
			sinon.restore();
		});

		it('Should call the postSaveHook hook once after saving the record', async () => {

			const postSaveHook = sinon.fake.resolves();

			class MyUpdateOneApiWithHook extends MyUpdateOneApi {
				async postSaveHook(...args) {
					return postSaveHook(...args);
				}
			}

			dataConnector = {
				updateOne: sinon.fake.resolves(1)
			};

			const myApi = new MyUpdateOneApiWithHook(deepClone(fullRequest));
			const response = await runApi(myApi);

			assert.deepStrictEqual(response.statusCode, 200);
			assert.deepStrictEqual(response.body, JSON.stringify({
				id: 10
			}));

			sinon.assert.calledOnce(dataConnector.updateOne);

			sinon.assert.calledOnce(postSaveHook);
			sinon.assert.calledWithExactly(postSaveHook, 10, sampleBody);
		});
	});

});
