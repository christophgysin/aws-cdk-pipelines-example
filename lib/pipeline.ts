import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import * as cicd from '@aws-cdk/pipelines';
import { Application } from './application'


export class ApplicationStage extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    new Application(this, 'Application');
  }
}

export class Pipeline extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    /*
    const repository = new codecommit.Repository(this, 'Repository', {
      repositoryName: 'cdk-pipeline-example',
    });
    new cdk.CfnOutput(this, 'RepoUrl', {
      value: repository.repositoryCloneUrlSsh,
    });
    */

    const repositoryName = 'cdk-pipeline-example';
    const repository = codecommit.Repository.fromRepositoryName(this, 'Repository', repositoryName);

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new cicd.CdkPipeline(this, 'Pipeline', {
      pipelineName: 'cdk-pipeline-example',
      cloudAssemblyArtifact,

      sourceAction: new actions.CodeCommitSourceAction({
        actionName: 'CodeCommit',
        repository,
        output: sourceArtifact,
      }),

      /* GITHUB
      sourceAction: new actions.GitHubSourceAction({
        actionName: 'GitHub',
        owner: 'GITHUB_OWNER',
        repo: 'GITHUB_REPO',
        oauthToken: cdk.SecretValue.secretsManager('GITHUB_TOKEN_NAME'),
        trigger: actions.GitHubTrigger.POLL,
        output: sourceArtifact,
      }),
      */

      synthAction: cicd.SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        buildCommand: 'npm run build',
      }),
    });

    const prodStage = pipeline.addApplicationStage(new ApplicationStage(this, 'Prod', {
      /*
      env: {
        account: '489660384731',
        region: 'eu-west-1',
      }
      */
    }));
    prodStage.addManualApprovalAction();
  }
}
