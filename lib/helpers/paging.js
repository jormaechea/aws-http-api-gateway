'use strict';

const { inspect } = require('util');

const PagingError = require('./paging-error');

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const numbersRegex = /^\d+$/;

const isValidInteger = number => Number.isInteger(number) || (typeof number === 'string' && number.match(numbersRegex));

const isValidPageNumber = pageNumber => pageNumber === undefined || pageNumber === null
	|| (isValidInteger(pageNumber) && pageNumber >= 1);

const isValidPageSize = (pageSize, maxPageSize) => pageSize === undefined || pageSize === null
	|| (isValidInteger(pageSize) && pageSize >= 1 && pageSize <= maxPageSize);

module.exports = class Paging {

	constructor(defaultPageSize, maxPageSize) {
		this.defaultPageSize = defaultPageSize || DEFAULT_PAGE_SIZE;
		this.maxPageSize = maxPageSize || MAX_PAGE_SIZE;
	}

	parseRequestPagingParams(pageNumber, pageSize) {

		if(!isValidPageNumber(pageNumber))
			throw new PagingError(`Invalid page number ${inspect(pageNumber)}`);

		if(!isValidPageSize(pageSize, this.maxPageSize))
			throw new PagingError(`Invalid page size ${inspect(pageSize)}`);

		return {
			pageNumber: Number.parseInt(pageNumber || 1, 10),
			pageSize: Number.parseInt(pageSize || this.defaultPageSize, 10)
		};
	}

};
