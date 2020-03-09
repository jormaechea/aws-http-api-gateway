'use strict';

const mapQueryString = require('amazon-api-gateway-querystring');

module.exports = class Api {

	constructor(request) {
		this._request = request;
		this._response = {
			statusCode: 200
		};
	}

	get request() {
		return this._request;
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

	set headers(headers) {
		this._response.headers = {
			...(this._response.headers || {}),
			...headers
		};
	}

	set statusCode(statusCode) {
		this._response.statusCode = statusCode;
	}

	set body(body) {
		this._response.body = body;
	}

	get response() {
		return this._response;
	}

	// get dataValidator() {
	// }

	// get headersValidator() {
	// }

	// async validate() {
	// }

	// async process() {
	// }

};