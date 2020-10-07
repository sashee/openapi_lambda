# Example project to use OpenAPI specification to implement routing and validation in AWS Lambda

It creates an API that uses the [api.yml](src/api.yml) specification for routing and validation.

For example, the operation that lists the users is defined in the [API](src/api.yml#L12):

```
/user:
  get:
    operationId: listUsers
    summary: List users
    responses:
      200:
        description: successful operation
```

This gets routed to the [listUsers](src/index.js#L7) function, connected by the ```operationId```:

```
listUsers: async () => {
  const items = await docClient.scan({
    TableName: process.env.TABLE,
  }).promise();
  console.log(items.Items);

  return items.Items;
},
```

## Requirements

* npm
* terraform

## Install

* ```terraform init```
* ```terraform apply```

## Usage

The ```url``` output is a deployed Swagger UI that allows easy experimentation with the deployed API.

## Cleanup

* ```terraform destroy```
