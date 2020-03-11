'use strict';

module.exports = class PagingError extends Error {
	constructor(message) {
		super(message);
		this.name = 'PagingError';
	}
};
