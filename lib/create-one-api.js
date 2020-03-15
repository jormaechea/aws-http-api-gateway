'use strict';

const Api = require('./api');

const ConfigurationError = require('./configuration-error');

module.exports = class CreateOneApi extends Api {

	async dataValidator() {
		if(this.bodyValidator)
			return this.bodyValidator(this.body);
	}

	async process() {

		const {
			dataConnector
		} = this;

		if(!dataConnector)
			throw new ConfigurationError('Missing dataConnector. Review the documentation');

		if(!dataConnector.insertOne || typeof dataConnector.insertOne !== 'function')
			throw new ConfigurationError('dataConnector must have a insertOne method. Review the documentation');

		let dataToInsert = this.body;
		if(this.formatRecord && typeof this.formatRecord === 'function')
			dataToInsert = await this.formatRecord(dataToInsert);

		const insertedId = await dataConnector.insertOne(dataToInsert);

		if(!insertedId)
			throw new Error('Failed to insert');

		if(this.postSaveHook && typeof this.postSaveHook === 'function')
			await this.postSaveHook(insertedId);

		const response = { id: insertedId };

		if(this.formatResponse && typeof this.formatResponse === 'function')
			return this.setBody(await this.formatResponse(response));

		this.setBody(response);
	}

};
