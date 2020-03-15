'use strict';

const mapQueryString = require('amazon-api-gateway-querystring');

module.exports = class Api {

	constructor(request) {
		this._request = request;
		this._response = {
			headers: {
				'content-type': 'application/json',
				'x-powered-by': 'aws-http-api-gateway'
			}
		};
	}

	get authorizerClaims() {
		return this._request.authorizer && this._request.authorizer.claims;
	}

	get authorizerScopes() {
		const claims = this.authorizerClaims;
		return claims && (claims.scope || claims.scp);
	}

	get pathParameters() {
		return this._request.pathParameters;
	}

	get rawHeaders() {
		return this._request.headers;
	}

	get headers() {
		if(!this._request.mappedHeaders) {
			this._request.mappedHeaders = {};
			Object.entries(this._request.headers)
				.forEach(([headerName, headerValue]) => {
					this._request.mappedHeaders[headerName.toLowerCase()] = headerValue;
				});
		}

		return this._request.mappedHeaders;
	}

	get qs() {
		if(!this._request.parsedQs)
			this._request.parsedQs = mapQueryString(this._request.queryStringParameters || {});

		return this._request.parsedQs;
	}

	get body() {
		if(!this._request.parsedBody)
			this._request.parsedBody = this._request.body && JSON.parse(this._request.body);

		return this._request.parsedBody;
	}

	setHeaders(headers) {
		this._response.headers = {
			...this._response.headers,
			...headers
		};
	}

	setStatusCode(statusCode) {
		this._response.statusCode = statusCode;
	}

	setBody(body) {
		this._response.body = body;
	}

	get statusCode() {
		return this._response.statusCode;
	}

	get response() {
		return {
			...this._response,
			statusCode: this.statusCode || 200
		};
	}

};
