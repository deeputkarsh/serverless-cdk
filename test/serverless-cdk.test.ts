import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { MainStack } from '../app/main-stack';

test('Api gateway created', () => {
    const app = new App();
    const stack = new MainStack(app, 'serverless-cdk', {});
    const template = Template.fromStack(stack);

    template.hasResourceProperties('AWS::ApiGateway::RestApi', {
        Name: 'serverless-cdk'
    });
});

test('get lambda created', () => {
    const app = new App();
    const stack = new MainStack(app, 'serverless-cdk', {});
    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::Lambda::Function', {
        Handler: 'index.handler',
        Runtime: 'nodejs18.x',
        Timeout: 15
    })
})