const crypto = require("crypto");
const AWS = require("aws-sdk");
const docClient = new AWS.DynamoDB.DocumentClient();
const {OpenAPIBackend} = require("openapi-backend");

const api = new OpenAPIBackend({definition: "api.yml", quick: true, handlers: {
	listUsers: async () => {
		const items = await docClient.scan({
			TableName: process.env.TABLE,
		}).promise();
		console.log(items.Items);

		return items.Items;
	},
	createUser: async (c) => {
		const user = c.request.requestBody;
		const userid = crypto.randomBytes(16).toString("hex");

		await docClient.put({
			TableName: process.env.TABLE,
			Item: {
				...user,
				userid,
			},
		}).promise();
		
		return {userid};
	},
	getUser: async (c) => {
		const userid = c.request.params.userid;

		const user = await docClient.get({
			TableName: process.env.TABLE,
			Key: {userid},
		}).promise();

		return user.Item;
	},
	updateUser: async (c) => {
		const userid = c.request.params.userid;
		const user = c.request.requestBody;

		await docClient.put({
			TableName: process.env.TABLE,
			Item: {
				...user,
				userid,
			},
		}).promise();

		return {status: "OK"};
	},
	deleteUser: async (c) => {
		const userid = c.request.params.userid;

		await docClient.delete({
			TableName: process.env.TABLE,
			Key: {userid},
		}).promise();

		return {status: "OK"};
	},
	notFound: (c) => {
		if (c.request.method === "options") {
			return {
				statusCode: 200,
			};
		}else {
			return {
				statusCode: 404,
				body: "Not found",
			};
		}
	},
	validationFail: () => {
		return {
			statusCode: 400,
		};
	}
}});

module.exports.handler = async (event) => {
	return api.handleRequest({
		method: event.requestContext.http.method,
		path: event.requestContext.http.path,
		query: event.queryStringParameters,
		body: event.body,
		headers: event.headers,
	});
};
