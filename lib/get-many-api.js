'use strict';

const Api = require('./api');

const Filter = require('./helpers/filter');
const Sort = require('./helpers/sort');
const Paging = require('./helpers/paging');

const ConfigurationError = require('./configuration-error');

module.exports = class GetManyApi extends Api {

	dataValidator() {

		if(this.filtersDefinition) {

			const requestFilters = this.qs.filters;

			if(requestFilters) {
				const filterHelper = new Filter(this.filtersDefinition);
				this.filters = filterHelper.parseRequestFilters(requestFilters);
			}
		}

		if(this.qs.sortBy) {
			const sortHelper = new Sort(this.sortableFields || []);
			this.sortParams = sortHelper.parseRequestSortParams(this.qs.sortBy, this.qs.sortCriteria);
		}

		const pagingHelper = new Paging();
		this.pagingParams = pagingHelper.parseRequestPagingParams(this.qs.page, this.qs.pageSize);
	}

	async process() {

		const {
			dataConnector
		} = this;

		if(!dataConnector)
			throw new ConfigurationError('Missing dataConnector. Review the documentation');

		if(!dataConnector.get || typeof dataConnector.get !== 'function')
			throw new ConfigurationError('dataConnector must have a get method. Review the documentation');

		const fetchParams = {
			...this.sortParams,
			...this.pagingParams,
			filters: { ...this.filters }
		};

		let records = await dataConnector.get(fetchParams);

		if(this.formatRecords && typeof this.formatRecords === 'function')
			records = await this.formatRecords(records);

		if(this.formatRecord && typeof this.formatRecord === 'function')
			records = await Promise.all(records.map(record => this.formatRecord(record)));

		this.setBody(records);
	}
};
