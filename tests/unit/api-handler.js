'use strict';

const sinon = require('sinon');
const assert = require('assert').strict;

const {
	ApiHandler,
	Api: BaseApi
} = require('../../lib');

describe('API Handler', () => {

	afterEach(() => {
		sinon.restore();
	});

	class BaseApiSuccess extends BaseApi {
		async process() {
			return true;
		}
	}

	context('dataValidator is defined', () => {

		let dataValidator;

		class MyApi extends BaseApiSuccess {
			get dataValidator() {
				return dataValidator;
			}
		}

		it('Should call the dataValidator function if it\'s defined', async () => {

			dataValidator = sinon.fake();

			await ApiHandler(MyApi)({});

			sinon.assert.calledOnce(dataValidator);
		});

		it('Should return a successfull response if dataValidator doesn\'t throw', async () => {

			dataValidator = sinon.fake();

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response.statusCode, 200);
			sinon.assert.calledOnce(dataValidator);
		});

		it('Should return a client error and a message if dataValidator rejects', async () => {

			dataValidator = sinon.fake.rejects(new Error('Some error'));

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 400,
				body: {
					message: 'Some error'
				}
			});
			sinon.assert.calledOnce(dataValidator);
		});

		it('Should return a client error and a message if dataValidator throws', async () => {

			dataValidator = sinon.fake.throws(new Error('Some error'));

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 400,
				body: {
					message: 'Some error'
				}
			});
			sinon.assert.calledOnce(dataValidator);
		});
	});

	context('headersValidator is defined', () => {

		let headersValidator;

		class MyApi extends BaseApiSuccess {
			get headersValidator() {
				return headersValidator;
			}
		}

		it('Should call the headersValidator function if it\'s defined', async () => {

			headersValidator = sinon.fake();

			await ApiHandler(MyApi)({});

			sinon.assert.calledOnce(headersValidator);
		});

		it('Should return a successfull response if headersValidator doesn\'t throw', async () => {

			headersValidator = sinon.fake();

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response.statusCode, 200);
			sinon.assert.calledOnce(headersValidator);
		});

		it('Should return a client error and a message if headersValidator rejects', async () => {

			headersValidator = sinon.fake.rejects(new Error('Some error'));

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 400,
				body: {
					message: 'Some error'
				}
			});
			sinon.assert.calledOnce(headersValidator);
		});

		it('Should return a client error and a message if headersValidator throws', async () => {

			headersValidator = sinon.fake.throws(new Error('Some error'));

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 400,
				body: {
					message: 'Some error'
				}
			});
			sinon.assert.calledOnce(headersValidator);
		});
	});

	context('validate is defined', () => {

		let validate;

		class MyApi extends BaseApiSuccess {
			async validate() {
				return validate();
			}
		}

		it('Should call the validate function if it\'s defined', async () => {

			validate = sinon.fake();

			await ApiHandler(MyApi)({});

			sinon.assert.calledOnce(validate);
		});

		it('Should return a successfull response if validate doesn\'t throw', async () => {

			validate = sinon.fake();

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response.statusCode, 200);
			sinon.assert.calledOnce(validate);
		});

		it('Should return a client error and a message if validate rejects', async () => {

			validate = sinon.fake.rejects(new Error('Some error'));

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 400,
				body: {
					message: 'Some error'
				}
			});
			sinon.assert.calledOnce(validate);
		});

		it('Should return a client error and a message if validate throws', async () => {

			validate = sinon.fake.throws(new Error('Some error'));

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 400,
				body: {
					message: 'Some error'
				}
			});
			sinon.assert.calledOnce(validate);
		});
	});

	context('process', () => {

		let processFake;

		class MyApi extends BaseApiSuccess {
			async process() {
				return processFake(this);
			}
		}

		class MySyncApi extends BaseApiSuccess {
			process() {
				return processFake(this);
			}
		}

		it('Should call the process function if it\'s defined', async () => {

			processFake = sinon.fake();

			await ApiHandler(MyApi)({});

			sinon.assert.calledOnce(processFake);
		});

		it('Should return a successfull response if process doesn\'t throw', async () => {

			processFake = sinon.fake();

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response.statusCode, 200);
			sinon.assert.calledOnce(processFake);
		});

		it('Should reject if process rejects without setting a statusCode', async () => {

			const myError = new Error('Some error');
			processFake = sinon.fake.rejects(myError);

			await assert.rejects(() => ApiHandler(MyApi)({}));

			sinon.assert.calledOnce(processFake);
		});

		it('Should reject if process throws without setting a statusCode', async () => {

			processFake = sinon.fake.throws(new Error('Some error'));

			await assert.rejects(() => ApiHandler(MySyncApi)({}));

			sinon.assert.calledOnce(processFake);
		});

		it('Should reject if process rejects setting a 5xx statusCode', async () => {

			const myError = new Error('Some error');
			processFake = sinon.stub().callsFake(async apiInstance => {
				apiInstance.setStatusCode(502);
				throw myError;
			});

			await assert.rejects(() => ApiHandler(MyApi)({}));

			sinon.assert.calledOnce(processFake);
		});

		it('Should reject if process throws setting a 5xx statusCode', async () => {

			const myError = new Error('Some error');
			processFake = sinon.stub().callsFake(apiInstance => {
				apiInstance.setStatusCode(502);
				throw myError;
			});

			await assert.rejects(() => ApiHandler(MySyncApi)({}));

			sinon.assert.calledOnce(processFake);
		});

		it('Should return a client error if process rejects setting a 4xx statusCode', async () => {

			const myError = new Error('Some error');
			processFake = sinon.stub().callsFake(async apiInstance => {
				apiInstance.setStatusCode(404);
				throw myError;
			});

			const response = await ApiHandler(MyApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 404,
				body: {
					message: 'Some error'
				}
			});

			sinon.assert.calledOnce(processFake);
		});

		it('Should return a client error if process throws setting a 4xx statusCode', async () => {

			const myError = new Error('Some error');
			processFake = sinon.stub().callsFake(apiInstance => {
				apiInstance.setStatusCode(404);
				throw myError;
			});

			const response = await ApiHandler(MySyncApi)({});

			assert.deepStrictEqual(response, {
				statusCode: 404,
				body: {
					message: 'Some error'
				}
			});

			sinon.assert.calledOnce(processFake);
		});
	});
});
