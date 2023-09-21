#!/usr/bin/env node
import 'source-map-support/register';
import 'dotenv/config'
import { App, Tags } from 'aws-cdk-lib';
import cdkConfig from './cdk-config';
import { MyPipelineStack } from './pipeline';

const app = new App();

const myStack = new MyPipelineStack(app, 'PipelineStack', {
  env: {
    account: '650318046296',
    region: 'us-west-2',
  }
})

Tags.of(myStack).add('billingCode', cdkConfig.PROJECT_NAME);
Tags.of(myStack).add('environment', cdkConfig.STAGE);