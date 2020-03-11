'use strict';

const assert = require('assert').strict;

const {
	helpers: {
		Sort
	}
} = require('../../../lib');

describe('Helpers', () => {
	describe('Sort', () => {

		describe('parseRequestSortParams()', () => {

			context('When no sort field is received', () => {
				it('Should return an empty object', () => {
					const sort = new Sort();
					const result = sort.parseRequestSortParams();

					assert.deepStrictEqual(result, {});
				});
			});

			context('When an invalid sort field or criteria is received', () => {
				it('Should throw if no sortable fields are set', () => {
					const sort = new Sort();
					assert.throws(() => sort.parseRequestSortParams('my-field'));
				});

				it('Should throw if sort field is not in sortable fields', () => {
					const sort = new Sort(['other-field']);
					assert.throws(() => sort.parseRequestSortParams('my-field'));
				});

				it('Should throw if sort criteria is not valid', () => {
					const sort = new Sort(['my-field']);
					assert.throws(() => sort.parseRequestSortParams('my-field', 'invalid'));
				});
			});

			context('When valid sort field and criteria are received', () => {
				it('Should return the default criteria', () => {
					const sort = new Sort(['my-field']);
					const result = sort.parseRequestSortParams('my-field');

					assert.deepStrictEqual(result, {
						sortBy: 'my-field',
						sortCriteria: 'asc'
					});
				});

				it('Should return asc criteria if it\'s received', () => {
					const sort = new Sort(['my-field']);
					const result = sort.parseRequestSortParams('my-field', 'asc');

					assert.deepStrictEqual(result, {
						sortBy: 'my-field',
						sortCriteria: 'asc'
					});
				});

				it('Should return desc criteria if it\'s received', () => {
					const sort = new Sort(['my-field']);
					const result = sort.parseRequestSortParams('my-field', 'desc');

					assert.deepStrictEqual(result, {
						sortBy: 'my-field',
						sortCriteria: 'desc'
					});
				});
			});
		});

	});
});
