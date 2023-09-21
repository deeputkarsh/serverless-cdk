import middyfy from "../utils/middyfy"
import { APIGatewayProxyEvent } from "aws-lambda"
export const handler = middyfy(async (event: APIGatewayProxyEvent) => {
  console.log("called with", event)
  return "Hello from default route"
})
