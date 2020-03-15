'use strict';

const Api = require('./api');

const ConfigurationError = require('./configuration-error');

module.exports = class UpdateOneApi extends Api {

	async dataValidator() {
		if(!this.pathParameters || !this.pathParameters.id)
			throw new Error('Missing ID in request path');

		if(this.bodyValidator)
			return this.bodyValidator(this.body);
	}

	async process() {

		const {
			dataConnector
		} = this;

		if(!dataConnector)
			throw new ConfigurationError('Missing dataConnector. Review the documentation');

		if(!dataConnector.updateOne || typeof dataConnector.updateOne !== 'function')
			throw new ConfigurationError('dataConnector must have a updateOne method. Review the documentation');

		let dataToUpdate = this.body;
		if(this.formatRecord && typeof this.formatRecord === 'function')
			dataToUpdate = await this.formatRecord(dataToUpdate);

		const updatedQuantity = await dataConnector.updateOne(this.pathParameters.id, dataToUpdate);

		if(!updatedQuantity) {
			this.setStatusCode(404);
			throw new Error('Not found');
		}

		if(this.postSaveHook && typeof this.postSaveHook === 'function')
			await this.postSaveHook(this.pathParameters.id, dataToUpdate);

		const response = { id: this.pathParameters.id };

		if(this.formatResponse && typeof this.formatResponse === 'function')
			return this.setBody(await this.formatResponse(response));

		this.setBody(response);
	}

};
