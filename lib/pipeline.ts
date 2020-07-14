import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import * as cicd from '@aws-cdk/pipelines';
import { Api } from './api'
import { Frontend } from './frontend'

export class ApplicationStage extends cdk.Stage {
  readonly apiUrl: cdk.CfnOutput;
  readonly websiteUrl: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const api = new Api(this, 'Api');
    this.apiUrl = api.apiUrl;
    const frontend = new Frontend(this, 'Frontend');
    this.websiteUrl = frontend.websiteUrl;
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
        synthCommand: 'npx cdk synth --verbose',
      }),
    });

    const prodStage = pipeline.addStage('Prod');
    const application = new ApplicationStage(this, 'Application')
    prodStage.addApplication(application)
    prodStage.addActions(new cicd.ShellScriptAction({
      actionName: 'SmokeTest',
      commands: [
        'curl -Ssf $WEBSITE_URL',
        'curl -Ssf $API_URL',
      ],
      useOutputs: {
        API_URL: pipeline.stackOutput(application.apiUrl),
        WEBSITE_URL: pipeline.stackOutput(application.websiteUrl),
      },
    }));
  }
}
