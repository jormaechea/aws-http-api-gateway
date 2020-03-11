'use strict';

const SortError = require('./sort-error');

const validCriterias = ['asc', 'desc'];

const DEFAULT_SORT_CRITERIA = 'asc';

const isValidSortCriteria = criteria => validCriterias.includes(criteria.toLowerCase());

module.exports = class Sort {

	constructor(sortableFields = []) {
		this.sortableFields = {};

		sortableFields.forEach(field => {
			this.sortableFields[field] = true;
		});
	}

	parseRequestSortParams(requestSortField, requestSortCriteria) {

		if(!requestSortField)
			return {};

		if(!this.sortableFields[requestSortField])
			throw new SortError(`Invalid sort field ${requestSortField}`);

		if(requestSortCriteria && !isValidSortCriteria(requestSortCriteria))
			throw new SortError(`Invalid sort criters ${requestSortCriteria}`);

		return {
			sortBy: requestSortField,
			sortCriteria: requestSortCriteria ? requestSortCriteria.toLowerCase() : DEFAULT_SORT_CRITERIA
		};
	}

};
