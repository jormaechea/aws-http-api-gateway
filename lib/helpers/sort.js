'use strict';

const SortError = require('./sort-error');

const validCriterias = ['asc', 'desc'];

const isValidSortCriteria = criteria => validCriterias.includes(criteria.toLowerCase());

module.exports = class Sort {

	constructor(sortableFields) {
		this.sortableFields = {};

		sortableFields.forEach(field => {
			this.sortableFields[field] = true;
		});
	}

	parseRequestSortParams(requestSortField, requestSortCriteria) {

		if(!this.sortableFields[requestSortField])
			throw new SortError(`Invalid sort field ${requestSortField}`);

		if(!isValidSortCriteria(requestSortCriteria))
			throw new SortError(`Invalid sort criters ${requestSortCriteria}`);

		return {
			sortBy: requestSortField,
			sortCriteria: requestSortCriteria.toLowerCase()
		};
	}

};
