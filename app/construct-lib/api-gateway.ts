import { EndpointType, IResource, LambdaIntegration, LambdaRestApi, MethodOptions, RestApi } from "aws-cdk-lib/aws-apigateway";
import { Construct } from "constructs";
import { ApiLambda } from "./lambdas";
import { HTTP_METHOD } from "../types/http";

interface ApiGatewayProps {
    serviceName: string,
    baseLambdaEntryPoint: string,
    defaultLambdaFile: string
    stageName?: string,
    cors?: boolean
}
interface AttachLambdaProps {
    path: string,
    method: HTTP_METHOD,
    fileName: string,
    handlerName?: string,
    methodOptions?: MethodOptions
}
export class ApiGateway extends Construct {
    api: RestApi
    openApiDef: any
    baseLambdaEntryPoint: string
    serviceName: string
    resources: Record<string, IResource>

    constructor(scope: Construct, id: string, props: ApiGatewayProps) {
        super(scope, `${id}Construct`)
        const { serviceName, baseLambdaEntryPoint, defaultLambdaFile, stageName = "v1", cors = false } = props
        this.baseLambdaEntryPoint = baseLambdaEntryPoint
        this.resources = {}
        this.serviceName = serviceName
        const defaultLambda = new ApiLambda(this, 'root', {
            serviceName: this.serviceName,
            codeFilePath: `${this.baseLambdaEntryPoint}/${defaultLambdaFile}.ts`,
        })
        this.api = new LambdaRestApi(scope, id, {
            restApiName: this.serviceName,
            handler: defaultLambda.mainResource,
            proxy: false,
            deployOptions: { stageName },
            endpointConfiguration: { types: [EndpointType.REGIONAL] }
        })
        this.api.root.addProxy()
    }

    getResource(path: string) {
        let resourceKey = path
        let currentResource = this.resources[resourceKey] || this.api.root
        if (!this.resources[resourceKey] && resourceKey !== '/') {
            let resourcePath = path
            const pathArray = path.split('/')
            if (pathArray.length > 1) {
                console.log(pathArray)
                resourcePath = pathArray.pop() as string
                currentResource = this.getResource(pathArray.join('/'))
            }
            this.resources[resourceKey] = currentResource.addResource(resourcePath)
            currentResource = this.resources[resourceKey]
        }
        console.log('this.resources', Object.values(this.resources).map(it => it.path))
        console.log('path', path, 'currentResource', currentResource.path)
        return currentResource
    }

    addRoute(options: AttachLambdaProps) {
        const {
            path,
            method,
            fileName,
            handlerName = 'handler',
            methodOptions
        } = options;
        const functionName = `${fileName}-${handlerName}`
        const lambda = new ApiLambda(this, functionName, {
            serviceName: this.serviceName,
            codeFilePath: `${this.baseLambdaEntryPoint}/${fileName}.ts`,
            handlerName
        })
        const resource = this.getResource(path)
        resource.addMethod(method, new LambdaIntegration(lambda.mainResource), methodOptions)
    }

}