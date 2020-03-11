'use strict';

const PagingError = require('./paging-error');

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 100;

const isValidPageNumber = pageNumber => pageNumber === undefined || pageNumber === null
	|| (Number.isInteger(pageNumber) && pageNumber >= 1);

const isValidPageSize = (pageSize, maxPageSize) => pageSize === undefined || pageSize === null
	|| (Number.isInteger(pageSize) && pageSize >= 1 && pageSize <= maxPageSize);

module.exports = class Sort {

	constructor(defaultPageSize, maxPageSize) {
		this.defaultPageSize = defaultPageSize || DEFAULT_PAGE_SIZE;
		this.maxPageSize = maxPageSize || MAX_PAGE_SIZE;
	}

	parseRequestPagingParams(pageNumber, pageSize) {

		if(!isValidPageNumber(pageNumber))
			throw new PagingError(`Invalid page number ${pageNumber}`);

		if(!isValidPageSize(pageSize, this.maxPageSize))
			throw new PagingError(`Invalid page size ${pageSize}`);

		return {
			pageNumber: pageNumber || 1,
			pageSize: pageSize || this.defaultPageSize
		};
	}

};
