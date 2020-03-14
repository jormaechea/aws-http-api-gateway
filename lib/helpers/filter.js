'use strict';

const { inspect } = require('util');

const FilterError = require('./filter-error');

const handleInternalName = (internalName, name, initialValue, mappedValue) => {
	if(typeof internalName === 'function')
		return internalName(name, initialValue, mappedValue);

	return internalName;
};

const filterOperators = {
	equal: 'equal',
	notEqual: 'notEqual',
	lesser: 'lesser',
	lesserOrEqual: 'lesserOrEqual',
	greaterOrEqual: 'greaterOrEqual',
	greater: 'greater',
	between: 'between'
};

const makeFilterFunction = (name, internalName, valueMapper, operator = filterOperators.equal) => (currentFilters, filterValue) => {
	const finalValue = valueMapper ? valueMapper(filterValue) : filterValue;
	const finalName = internalName ? handleInternalName(internalName, name, filterValue, finalValue) : name;

	return {
		...currentFilters,
		[finalName]: {
			...currentFilters[finalName],
			[operator]: finalValue
		}
	};
};

const parseFiltersDefinition = filtersDefinition => filtersDefinition.reduce((acum, filterDefinition) => {

	if(typeof filterDefinition === 'string')
		filterDefinition = { name: filterDefinition };

	if(!filterDefinition.name)
		throw new FilterError(`Missing required property name for filter definition: ${inspect(filterDefinition)}`);

	const { name, internalName, valueMapper, operator } = filterDefinition;

	if(!acum[name])
		acum[name] = [];

	acum[name].push(makeFilterFunction(name, internalName, valueMapper, operator));

	return acum;
}, {});

module.exports = class Filter {

	constructor(filtersDefinition = []) {
		this.filtersDefinition = parseFiltersDefinition(filtersDefinition);
	}

	static get operators() {
		return filterOperators;
	}

	parseRequestFilters(requestFilters) {
		return Object.entries(requestFilters || {})
			.reduce((acum, [filterName, filterValue]) => {
				if(!this.filtersDefinition[filterName])
					return acum;

				return this.filtersDefinition[filterName]
					.reduce((filterAcum, fn) => fn(filterAcum, filterValue), acum);
			}, {});
	}

};
