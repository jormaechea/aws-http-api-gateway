'use strict';

module.exports = Api => async event => {

	const api = new Api(event);

	if(api.dataValidator && typeof api.dataValidator === 'function') {
		try {
			await api.dataValidator();
		} catch(validationError) {
			return {
				statusCode: api.statusCode || 400,
				body: JSON.stringify({
					message: validationError.message
				})
			};
		}
	}

	if(api.headersValidator && typeof api.headersValidator === 'function') {
		try {
			await api.headersValidator();
		} catch(validationError) {
			return {
				statusCode: api.statusCode || 400,
				body: JSON.stringify({
					message: validationError.message
				})
			};
		}
	}

	if(api.validate && typeof api.validate === 'function') {
		try {
			await api.validate();
		} catch(validationError) {
			return {
				statusCode: api.statusCode || 400,
				body: JSON.stringify({
					message: validationError.message
				})
			};
		}
	}

	try {

		await api.process();

		return api.response;

	} catch(processError) {

		const statusCode = api.statusCode || 500;

		if(statusCode >= 500)
			throw processError;

		return {
			statusCode,
			body: JSON.stringify({
				message: processError.message
			})
		};
	}
};
