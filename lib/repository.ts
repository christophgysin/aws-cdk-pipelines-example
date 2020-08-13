import * as codecommit from '@aws-cdk/aws-codecommit';
import * as cdk from '@aws-cdk/core';

export interface RepositoryProps extends cdk.StackProps {
  owner: string
  repo: string
};
