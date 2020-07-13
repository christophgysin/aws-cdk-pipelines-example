import * as codecommit from '@aws-cdk/aws-codecommit';
import * as cdk from '@aws-cdk/core';

export class Repository extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const repository = new codecommit.Repository(this, 'Repository', {
      repositoryName: 'cdk-pipeline-example',
    });

    new cdk.CfnOutput(this, 'RepoUrl', {
      value: repository.repositoryCloneUrlSsh,
    });
  }
}
