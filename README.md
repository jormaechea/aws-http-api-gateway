# AWS HTTP API Gateway Framework

[![npm version](https://badgen.net/npm/v/aws-http-api-gateway)](https://www.npmjs.com/package/aws-http-api-gateway)
[![Build Status](https://travis-ci.org/jormaechea/aws-http-api-gateway.svg?branch=master)](https://travis-ci.org/jormaechea/aws-http-api-gateway)
[![Coverage Status](https://coveralls.io/repos/github/jormaechea/aws-http-api-gateway/badge.svg?branch=master)](https://coveralls.io/github/jormaechea/aws-http-api-gateway?branch=master)

**AWS API Gateway - HTTP API Framework** -- _Also called API Gateway v2_.

A framework to easily implement HTTP APIs in AWS API Gateway. Implement CRUD operations in less than 100 lines of code!

Test a working [demo](https://github.com/jormaechea/aws-http-api-gateway-demo) for your own with this repo.

# Docs

The framework complete docs can be found [here](docs/README.md).

## Quick start

1. Install via npm

```bash
npm i aws-http-api-gateway
```

2. Setup your serverless function

```yml
# serverless.yml
service:
  name: PetStore
provider:
  name: aws
  runtime: nodejs12.x
functions:
  PetsGetManyApi:
    handler: src/apis/pets/get-many.handler
    events:
      - httpApi: 'GET /pets'
```

3. Code your handler

```js
// src/apis/pets/get-many.js
'use strict';

const { GetManyApi, ApiHandler } = require('aws-http-api-gateway');

const PetConnector = require('../../connectors/pets');

const petConnector = new PetConnector();

class PetGetManyApi extends GetManyApi {

	get dataConnector() {
		return petConnector;
	}

};

module.exports.handler = ApiHandler(PetGetManyApi);

```

4. Code your data connector (implement with your favorite database)

```js
'use strict';

const dbHandler = require('some-db-handler');

module.exports = class PetsConnector {

	get(getParams) {
		return dbHandler.get(getParams);
	}

};
```

5. You're ready to go. Just deploy your service!

```bash
serverless deploy
```
