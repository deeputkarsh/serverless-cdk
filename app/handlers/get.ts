import middyfy from "../utils/middyfy"
import { APIGatewayProxyEvent } from "aws-lambda"

export const getAllHandler = middyfy(async (event: APIGatewayProxyEvent) => {
  console.log("called with", event)
  return "Hello from get all route"
})


export const handler = middyfy(async (event: APIGatewayProxyEvent) => {
  console.log("called with", event)
  return {
    message: "Hello from get by id route",
    receivedEvent: event
  }
})
