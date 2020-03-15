'use strict';

module.exports = class ConfigurationError extends Error {
	constructor(message) {
		super(message);
		this.name = 'ConfigurationError';
	}
};
