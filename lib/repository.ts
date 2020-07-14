import * as codecommit from '@aws-cdk/aws-codecommit';
import * as cdk from '@aws-cdk/core';

export interface RepositoryProps extends cdk.StackProps {
  repositoryName: string
};

export class Repository extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: RepositoryProps) {
    super(scope, id, props);

    const {
      repositoryName,
    } = props;

    const repository = new codecommit.Repository(this, 'Repository', {
      repositoryName,
    });

    new cdk.CfnOutput(this, 'RepoUrl', {
      value: repository.repositoryCloneUrlSsh,
    });
  }
}
