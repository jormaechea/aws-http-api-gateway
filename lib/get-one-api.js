'use strict';

const Api = require('./api');

const ConfigurationError = require('./configuration-error');

module.exports = class GetOneApi extends Api {

	async dataValidator() {
		if(!this.pathParameters || !this.pathParameters.id)
			throw new Error('Missing ID in request path');
	}

	async process() {

		const {
			dataConnector
		} = this;

		if(!dataConnector)
			throw new ConfigurationError('Missing dataConnector. Review the documentation');

		if(!dataConnector.getOne || typeof dataConnector.getOne !== 'function')
			throw new ConfigurationError('dataConnector must have a getOne method. Review the documentation');

		let record = await dataConnector.getOne(this.pathParameters.id);

		if(!record) {
			this.setStatusCode(404);
			throw new Error('Not found');
		}

		if(this.formatRecord && typeof this.formatRecord === 'function')
			record = await this.formatRecord(record);

		this.setBody(record);
	}

};
