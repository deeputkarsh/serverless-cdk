import { Stack, StackProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { ApiGateway } from './construct-lib/api-gateway';
import { ApiLambda } from './construct-lib/lambdas';
import { join } from 'path'
import { HTTP_METHOD } from './types/http';
interface MainStackProps extends StackProps {
  basePath?: string,
  v2Api?: boolean
}

export class MainStack extends Stack {
  apiGateway: ApiGateway
  defaultLambda: ApiLambda
  constructor(scope: Construct, id: string, props: MainStackProps) {
    super(scope, id, props);
    // const { basePath, v2Api } = props
    const baseLambdaEntryPoint = join(__dirname, 'handlers')
    this.apiGateway = new ApiGateway(this, "ApiGateway", {
      defaultLambdaFile: 'default-route',
      serviceName: this.stackName,
      baseLambdaEntryPoint
    })
    this.apiGateway.addRoute({ path: 'item', method: HTTP_METHOD.GET, fileName: 'get', handlerName: 'getAllHandler' })
    this.apiGateway.addRoute({ path: 'item/{id}', method: HTTP_METHOD.GET, fileName: 'get' })
  }
}
