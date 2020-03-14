'use strict';

module.exports = class FilterError extends Error {
	constructor(message) {
		super(message);
		this.name = 'FilterError';
	}
};
