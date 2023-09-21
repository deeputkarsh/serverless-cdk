import { Stack, StackProps, Stage, StageProps } from "aws-cdk-lib";
import { CodePipeline, CodePipelineSource, ShellStep } from "aws-cdk-lib/pipelines";
import { Construct } from "constructs";
import { MainStack } from "./main-stack";
import cdkConfig from "./cdk-config";


class MyApplication extends Stage {
  constructor(scope: Construct, id: string, props?: StageProps) {
    super(scope, id, props);
    const stackName = `${cdkConfig.PROJECT_NAME}-${cdkConfig.STAGE}`.toLowerCase()

    new MainStack(
      this,
      stackName,
      {
        stackName: stackName,
        description: `Serverless Application`,
        env: {
          region: cdkConfig.REGION,
        },
      }
    );
  }
}

export class MyPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const pipeline = new CodePipeline(this, 'Pipeline', {
      synth: new ShellStep('Synth', {
        // Use a connection created using the AWS console to authenticate to GitHub
        // Other sources are available.
        input: CodePipelineSource.connection('deeputkarsh/serverless-cdk', 'main', {
          connectionArn: 'arn:aws:codestar-connections:us-west-2:650318046296:connection/6ca5bff3-fbc6-4e59-a91e-27ddbf902923', // Created using the AWS console * });',
        }),
        commands: [
          'npm ci',
          'npm run build',
          'npx cdk synth',
        ],
      }),
    });

    // 'MyApplication' is defined below. Call `addStage` as many times as
    // necessary with any account and region (may be different from the
    // pipeline's).
    pipeline.addStage(new MyApplication(this, 'Prod', {
      env: {
        account: '650318046296',
        region: 'us-west-2',
      },
    }));
  }
}