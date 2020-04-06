'use strict';

const assert = require('assert').strict;

const {
	helpers: {
		Paging,
		PagingError
	}
} = require('../../../lib');

describe('Helpers', () => {
	describe('Paging', () => {

		describe('parseRequestPagingParams()', () => {

			context('When an invalid page number or size is received', () => {

				it('Should throw if page number is not a number', () => {
					const paging = new Paging();
					assert.throws(() => paging.parseRequestPagingParams('invalid-number'), PagingError);
				});

				it('Should throw if page number is not an integer', () => {
					const paging = new Paging();
					assert.throws(() => paging.parseRequestPagingParams(1.5), PagingError);
				});

				it('Should throw if page number is lower than one', () => {
					const paging = new Paging();
					assert.throws(() => paging.parseRequestPagingParams(0), PagingError);
					assert.throws(() => paging.parseRequestPagingParams(-10), PagingError);
				});

				it('Should throw if page size is not a number', () => {
					const paging = new Paging();
					assert.throws(() => paging.parseRequestPagingParams(null, 'invalid-number'), PagingError);
				});

				it('Should throw if page size is not an integer', () => {
					const paging = new Paging();
					assert.throws(() => paging.parseRequestPagingParams(null, 1.5), PagingError);
				});

				it('Should throw if page size is lower than one', () => {
					const paging = new Paging();
					assert.throws(() => paging.parseRequestPagingParams(null, 0), PagingError);
					assert.throws(() => paging.parseRequestPagingParams(null, -10), PagingError);
				});

				it('Should throw if page size is higher than max size', () => {
					const paging = new Paging();
					assert.throws(() => paging.parseRequestPagingParams(null, 200), PagingError);
				});

				it('Should throw if page size is higher than provided size', () => {
					const paging = new Paging(null, 2);
					assert.throws(() => paging.parseRequestPagingParams(null, 5), PagingError);
				});
			});

			context('When default values are used', () => {
				it('Should return default page number and size', () => {
					const paging = new Paging();
					const result = paging.parseRequestPagingParams();

					assert.deepStrictEqual(result, {
						pageNumber: 1,
						pageSize: 10
					});
				});
				it('Should return the provided default page number and size', () => {
					const paging = new Paging(30);
					const result = paging.parseRequestPagingParams();

					assert.deepStrictEqual(result, {
						pageNumber: 1,
						pageSize: 30
					});
				});
			});

			context('When valid sort field and criteria are received', () => {
				it('Should return the specified page number and size', () => {
					const paging = new Paging();
					const result = paging.parseRequestPagingParams(2, 50);

					assert.deepStrictEqual(result, {
						pageNumber: 2,
						pageSize: 50
					});
				});

				it('Should return the specified page number and size as stringified numbers', () => {
					const paging = new Paging();
					const result = paging.parseRequestPagingParams('2', '50');

					assert.deepStrictEqual(result, {
						pageNumber: 2,
						pageSize: 50
					});
				});
			});
		});

	});
});
