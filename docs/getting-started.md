# Getting started

## About the framework

This is a framework to help you implement your project quickly based in REST APIs, using AWS HTTP APIs (also called API Gateway v2). While it could be achieved, **it's not intended to work with AWS REST API (aka API Gateway v1).**

## About the APIs

The framework is based in a couple of API types or operations:

- Get many
- Get one
- Create one
- Update one

And of course, every project may need some weird stuff, so a generic API is also exported in case you need it.

This APIs are quite agnostic to AWS Gateway HTTP APIs actually. They don't really care about the HTTP integration you chose, which makes them highly portable if you ever decide to move out from AWS or even from serverless mind set.

The only thing that ties your APIs to AWS API Gateway v2 is the API handler that's shipped with the framework. It takes care of exporting a lambda-like handler, calling your API methods and handling lambda compatible responses and errors.

If you ever decide to change (or if AWS launches v3 or something better), it should be quite easy to migrate your project. Nice, huh?

It's also DB agnostic, so you can use the database you choose, and even change it on the go, and your API shouldn't care.

## Basic structure

Your API files will have a structure similar to this one (ie, for a get many operation):

```js
const { GetManyApi, ApiHandler } = require('aws-http-api-gateway');

const YourFetcher = require('./some-path');

class YourGetManyApi extends GetManyApi {

	get dataConnector() {
		return YourFetcher;
	}
}

module.exports = ApiHandler(YourGetManyApi);
```

Looks pretty simple, but lets go step by step.

The first line just imports the API you want to implement and the HTTP API handler.

```js
const { GetManyApi, ApiHandler } = require('aws-http-api-gateway');
```

Then, we have an import of what we will call a fetcher. This is the connector between you APIs, and your data storage or database.

```js
const YourFetcher = require('./some-path');
```

Next thing we have, is the declaration of you API, extending from a base API and customizing it (we will see this with more details later). Each base API has it's own extendable points, we will discuss each of them.

```js
class YourGetManyApi extends GetManyApi {

	get dataConnector() {
		return YourFetcher;
	}
}
```

And finally, we export our agnostic API wrapped in a lambda handler:

```js
module.exports = ApiHandler(YourGetManyApi);
```

And that's all that it takes.
