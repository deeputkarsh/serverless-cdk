import { Duration } from "aws-cdk-lib";
import { ManagedPolicy, PolicyStatement, Role, ServicePrincipal } from "aws-cdk-lib/aws-iam";
import { Alias, Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs"
import { Construct } from "constructs";
import { ApiGateway } from "./api-gateway";
import { RetentionDays } from "aws-cdk-lib/aws-logs";

interface LambdaProps {
    codeFilePath: string,
    serviceName: string,
    handlerName?: string,
    runtime?: Runtime,
    timeout?: Duration,
    memorySize?: number,
    env?: Record<string, string>
    policies?: PolicyStatement[]
}


export class BaseLambda extends Construct {
    mainResource: NodejsFunction
    role: Role
    fnAlias: Alias
    constructor(scope: Construct, functionName: string, props: LambdaProps) {
        super(scope, `${functionName}Construct`)
        const {
            handlerName,
            serviceName,
            codeFilePath,
            runtime = Runtime.NODEJS_18_X,
            policies = [],
            timeout = Duration.seconds(15),
            memorySize = 256,
            env = {}
        } = props
        this.role = new Role(scope, `${functionName}Role`, {
            assumedBy: new ServicePrincipal("lambda.amazonaws.com"),
            managedPolicies: [
                ManagedPolicy.fromAwsManagedPolicyName("service-role/AWSLambdaBasicExecutionRole")
            ]
        })
        policies.forEach((policy) => this.role.addToPolicy(policy))
        const envVars: Record<string, string> = { ...env }
        this.mainResource = new NodejsFunction(scope, functionName, {
            runtime,
            functionName: `${serviceName}-${functionName}`,
            entry: codeFilePath,
            handler: handlerName,
            environment: envVars,
            role: this.role,
            timeout: timeout,
            memorySize: memorySize,
            logRetention: RetentionDays.THREE_MONTHS
        })
        this.fnAlias = this.mainResource.addAlias('Live')
    }
}

export class ApiLambda extends BaseLambda {
    constructor(scope: Construct, functionName: string, props: LambdaProps) {
        super(scope, functionName, props)
        this.fnAlias.addPermission("apigateway-permission", { principal: new ServicePrincipal("apigateway.amazonaws.com") })
    }
}