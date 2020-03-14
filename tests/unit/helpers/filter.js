'use strict';

const assert = require('assert').strict;

const {
	helpers: {
		Filter,
		FilterError
	}
} = require('../../../lib');

describe('Helpers', () => {
	describe('Filter', () => {

		describe('parseRequestFilters()', () => {

			context('Invalid filter definition', () => {
				it('Should throw if a filter definition has no name property', () => {
					assert.throws(() => new Filter([
						{ internalName: 'internalFoo' }
					]), FilterError);
				});
			});

			context('When no filters are received', () => {
				it('Should return an empty object (undefined filters)', () => {
					const filter = new Filter();
					const result = filter.parseRequestFilters();

					assert.deepStrictEqual(result, {});
				});

				it('Should return an empty object (null filters)', () => {
					const filter = new Filter();
					const result = filter.parseRequestFilters(null);

					assert.deepStrictEqual(result, {});
				});
			});

			context('When no filter definition has been received', () => {
				it('Should return an empty object (undefined definition)', () => {
					const filter = new Filter();
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {});
				});

				it('Should return an empty object (empty array definition)', () => {
					const filter = new Filter([]);
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {});
				});
			});

			context('When filter definition and request filters are received', () => {
				it('Should return an empty object if no filter matches the definition', () => {
					const filter = new Filter(['baz']);
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {});
				});

				it('Should return a filter object if one simple filter and default operator matches a string definition', () => {
					const filter = new Filter(['foo']);
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {
						foo: {
							equal: 'bar'
						}
					});
				});

				it('Should return a filter object if one simple filter and default operator matches a minimal object definition', () => {
					const filter = new Filter([{
						name: 'foo'
					}]);
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {
						foo: {
							equal: 'bar'
						}
					});
				});

				it('Should return a filter object using internal name from filter definition', () => {
					const filter = new Filter([{
						name: 'foo',
						internalName: 'internalFoo'
					}]);
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {
						internalFoo: {
							equal: 'bar'
						}
					});
				});

				it('Should return a filter object using the operator from filter definition', () => {
					const filter = new Filter([{
						name: 'foo',
						operator: Filter.operators.greater
					}]);
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {
						foo: {
							greater: 'bar'
						}
					});
				});

				it('Should return a filter object using the valueMapper from filter definition', () => {
					const filter = new Filter([{
						name: 'foo',
						valueMapper: v => `Mapped ${v}`
					}]);
					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {
						foo: {
							equal: 'Mapped bar'
						}
					});
				});

				it('Should return a filter object using internal name callback from filter definition', () => {

					const internalName = (name, filterValue, finalValue) => {
						assert.deepStrictEqual(name, 'foo');
						assert.deepStrictEqual(filterValue, 'bar');
						assert.deepStrictEqual(finalValue, 'BAR');

						return 'internalFoo';
					};

					const filter = new Filter([{
						name: 'foo',
						internalName,
						valueMapper: v => v.toUpperCase()
					}]);

					const result = filter.parseRequestFilters({
						foo: 'bar'
					});

					assert.deepStrictEqual(result, {
						internalFoo: {
							equal: 'BAR'
						}
					});
				});

				it('Should return a filter object for a filter with multiple definitions', () => {
					const filter = new Filter([
						{
							name: 'foo',
							operator: Filter.operators.greater,
							valueMapper: n => n - 1
						},
						{
							name: 'foo',
							operator: Filter.operators.lesser,
							valueMapper: n => n + 1
						}
					]);
					const result = filter.parseRequestFilters({
						foo: 10
					});

					assert.deepStrictEqual(result, {
						foo: {
							greater: 9,
							lesser: 11
						}
					});
				});

				it('Should return a filter object for multiple filters with multiple definitions', () => {
					const filter = new Filter([
						{
							name: 'foo',
							operator: Filter.operators.greater,
							valueMapper: n => n - 1
						},
						{
							name: 'foo',
							operator: Filter.operators.lesser,
							valueMapper: n => n + 1
						},
						'bar',
						{
							name: 'baz',
							internalName: 'bar',
							operator: Filter.operators.notEqual
						},
						'boo'
					]);
					const result = filter.parseRequestFilters({
						foo: 10,
						bar: 'test1',
						baz: 'test2',
						boo: 'test3'
					});

					assert.deepStrictEqual(result, {
						foo: {
							greater: 9,
							lesser: 11
						},
						bar: {
							equal: 'test1',
							notEqual: 'test2'
						},
						boo: {
							equal: 'test3'
						}
					});
				});
			});

		});
	});
});
