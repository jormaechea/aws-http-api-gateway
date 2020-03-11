'use strict';

module.exports = class SortError extends Error {
	constructor(message) {
		super(message);
		this.name = 'SortError';
	}
};
