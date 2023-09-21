import middy, { MiddyfiedHandler } from '@middy/core';
import validator from '@middy/validator';
import httpErrorHandler from '@middy/http-error-handler';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import { Handler, APIGatewayProxyResult } from "aws-lambda"


export default (handler: Handler, bodySchema?: any): MiddyfiedHandler => {
  let middyfiedHandler = middy(handler)
    .use(middyJsonBodyParser())
  if (bodySchema) {
    middyfiedHandler = middyfiedHandler.use(
      validator({
        inputSchema: {
          type: 'object',
          properties: { body: bodySchema },
        },
      } as any),
    )
  }
  middyfiedHandler = middyfiedHandler
    .use({
      // eslint-disable-next-line consistent-return
      onError: (request: any): APIGatewayProxyResult => {
        const { error } = request;
        if (error && error.name === 'BadRequestError') {
          const details = error.details || [];
          return {
            statusCode: 400,
            body: JSON.stringify({
              error: error.message,
              details: details.map(({ instancePath = '', message = '' }) => {
                const effectivePath = instancePath.replace(/^\/body\/?/, '');
                if (!effectivePath) return message;
                return `${effectivePath} ${message}`;
              }),
            }),
          };
        }
        return {
          statusCode: 500,
          body: JSON.stringify({
            error: (error && error.message) || 'Something went wrong',
          }),
        };
      },
    })
    .use(httpErrorHandler())
    .use(
      httpResponseSerializer({
        serializers: [
          {
            regex: /^application\/json$/,
            serializer: (data: { body: string | Record<string, any> }) => {
              const { body } = data;
              // console.log('response to be sent', data);
              if (typeof body === 'string') {
                return JSON.stringify({ message: body });
              }
              return JSON.stringify(body);
            },
          },
          {
            regex: /^text\/plain$/,
            serializer: ({ body }: { body: string }) => body,
          },
        ],
        defaultContentType: 'application/json',
      } as any),
    )
    .use({
      after: (request) => {
        console.log('response ready');
        if (request.response && typeof request.response.body === 'undefined') {
          console.log('move response to response.body');
          request.response = { statusCode: request.response.statusCode || 200, body: request.response };
        }
        console.log('request.response', request.response);
      },
    });
  return middyfiedHandler;
}