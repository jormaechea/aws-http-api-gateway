'use strict';

const handleMultiFilter = (currentDefinitions, newDefinition) => (
	Array.isArray(currentDefinitions)
		? [...currentDefinitions, newDefinition]
		: [currentDefinitions, newDefinition]
);

const parseFiltersDefinition = filtersDefinition => filtersDefinition.reduce((acum, filterDefinition) => {

	const { name } = filterDefinition;

	return {
		...acum,
		[name]: acum[name] ? handleMultiFilter(acum[name], filterDefinition) : filterDefinition
	};
}, {});

const handleInternalName = (internalName, name, initialValue, mappedValue) => {
	if(typeof internalName === 'function')
		return internalName(name, initialValue, mappedValue);

	return internalName;
};

module.exports = class Filter {

	constructor(filtersDefinition = []) {
		this.filtersDefinition = parseFiltersDefinition(filtersDefinition);
	}

	parseRequestFilters(requestFilters) {
		return Object.entries(requestFilters)
			.reduce((acum, [filterName, filterValue]) => {
				if(!this.filtersDefinition[filterName])
					return acum;

				return this._parseFilter(acum, this.filtersDefinition[filterName], filterValue);
			}, {});
	}

	_parseFilter(currentFilters, { name, internalName, valueMapper, operator = 'equal' }, filterValue) {

		const finalValue = valueMapper ? valueMapper(filterValue) : filterValue;
		const finalName = internalName ? handleInternalName(internalName, name, filterValue, finalValue) : name;

		return {
			...currentFilters,
			[finalName]: {
				...currentFilters[finalName],
				[operator]: finalValue
			}
		};
	}

};
