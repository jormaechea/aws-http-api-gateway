'use strict';

const ApiHandler = require('./api-handler');
const GetManyApi = require('./get-many-api');
const GetOneApi = require('./get-one-api');
const CreateOneApi = require('./create-one-api');
const UpdateOneApi = require('./update-one-api');
const Api = require('./api');

module.exports = {
	ApiHandler,
	GetManyApi,
	GetOneApi,
	CreateOneApi,
	UpdateOneApi,
	Api
};
