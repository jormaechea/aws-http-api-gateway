'use strict';

const assert = require('assert').strict;

const deepClone = require('lodash.clonedeep');

const {
	Api
} = require('../../lib');

describe('API', () => {

	const fullRequest = {
		headers: {
			'Content-Type': 'application/json',
			'X-Custom-Header': 'Some value'
		},
		queryStringParameters: {
			q: 'search',
			'id[0]': '100',
			'id[1]': '200'
		},
		body: JSON.stringify({
			foo: 'bar',
			baz: [1, 2, 3]
		}),
		pathParameters: {
			id: 10
		},
		authorizer: {
			claims: {
				custom: 'customClaim',
				scp: ['cats:read', 'dogs:write']
			}
		}
	};

	class MyApi extends Api {
		process() {
			this.setStatusCode(400);
			this.setBody({ my: 'response' });
			this.setHeaders({
				'content-type': 'application/json',
				'x-response-header': 'All good'
			});
		}
	}

	describe('Getters and setters', () => {

		it('Should return the request data with getters', () => {
			const myApi = new MyApi(deepClone(fullRequest));

			assert.deepStrictEqual(myApi.rawHeaders, fullRequest.headers);
			assert.deepStrictEqual(myApi.headers, {
				'content-type': 'application/json',
				'x-custom-header': 'Some value'
			});
			// Second call is to validate cached headers
			assert.deepStrictEqual(myApi.headers, {
				'content-type': 'application/json',
				'x-custom-header': 'Some value'
			});

			assert.deepStrictEqual(myApi.authorizerScopes, fullRequest.authorizer.claims.scp);
			assert.deepStrictEqual(myApi.pathParameters, fullRequest.pathParameters);

			assert.deepStrictEqual(myApi.qs, {
				q: 'search',
				id: ['100', '200']
			});
			// Second call is to validate cached qs
			assert.deepStrictEqual(myApi.qs, {
				q: 'search',
				id: ['100', '200']
			});

			assert.deepStrictEqual(myApi.body, {
				foo: 'bar',
				baz: [1, 2, 3]
			});
			// Second call is to validate cached body
			assert.deepStrictEqual(myApi.body, {
				foo: 'bar',
				baz: [1, 2, 3]
			});
		});

		it('Should return empty qs if they are not present in the request', () => {

			const {
				queryStringParameters,
				...request
			} = deepClone(fullRequest);

			const myApi = new MyApi(request);
			assert.deepStrictEqual(myApi.qs, {});
		});

		it('Should return the default response with statusCode 200 if it\'s not overriden', () => {
			const myApi = new MyApi(deepClone(fullRequest));
			assert.deepStrictEqual(myApi.response.statusCode, 200);
		});

		it('Should return the response data with getters', () => {
			const myApi = new MyApi(deepClone(fullRequest));
			myApi.process();

			assert.deepStrictEqual(myApi.statusCode, 400);
			assert.deepStrictEqual(myApi.response, {
				statusCode: 400,
				headers: {
					'x-powered-by': 'aws-http-api-gateway',
					'content-type': 'application/json',
					'x-response-header': 'All good'
				},
				body: JSON.stringify({
					my: 'response'
				})
			});
		});
	});

});
