import { APIGatewayProxyHandler } from 'aws-lambda';

const {
  ALLOWED_ORIGIN = '*',
} = process.env;

export const handler: APIGatewayProxyHandler = async (event) => {
  console.log('event:', JSON.stringify(event, null, 2));

  return {
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
    },
    body: JSON.stringify({
      message: 'Success',
    }),
  };
};
