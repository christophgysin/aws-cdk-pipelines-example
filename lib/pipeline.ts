import * as codecommit from '@aws-cdk/aws-codecommit';
import * as codepipeline from '@aws-cdk/aws-codepipeline';
import * as actions from '@aws-cdk/aws-codepipeline-actions';
import * as cdk from '@aws-cdk/core';
import * as cicd from '@aws-cdk/pipelines';
import { RepositoryProps } from './repository'
import { Application, ApplicationProps } from './application'

interface ApplicationStageProps extends cdk.StageProps {
  applicationProps: ApplicationProps
}

export class ApplicationStage extends cdk.Stage {
  readonly application: Application

  constructor(scope: cdk.Construct, id: string, props: ApplicationStageProps) {
    super(scope, id, props);

    this.application = new Application(this, 'Application', props.applicationProps);
  }
}

export interface PipelineProps extends cdk.StackProps {
  repositoryProps: RepositoryProps
  applicationProps: Omit<ApplicationProps, 'stage'>
}

export class Pipeline extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props: PipelineProps) {
    super(scope, id, props);

    const {
      repositoryProps: {
        owner,
        repo,
      },
      applicationProps,
    } = props;

    const sourceArtifact = new codepipeline.Artifact();
    const cloudAssemblyArtifact = new codepipeline.Artifact();

    const pipeline = new cicd.CdkPipeline(this, 'Pipeline', {
      pipelineName: 'cdk-pipeline-example',
      cloudAssemblyArtifact,

      sourceAction: new actions.GitHubSourceAction({
        actionName: 'GitHub',
        owner,
        repo,
        oauthToken: cdk.SecretValue.secretsManager('github-token'),
        trigger: actions.GitHubTrigger.POLL,
        output: sourceArtifact,
      }),

      synthAction: cicd.SimpleSynthAction.standardNpmSynth({
        sourceArtifact,
        cloudAssemblyArtifact,
        environment: {
          privileged: true,
        },
      }),
    });

    const prodApplication = new ApplicationStage(this, 'Prod', {
      applicationProps: {
        ...applicationProps,
        stage: 'prod',
      },
    })
    const prodStage = pipeline.addApplicationStage(prodApplication);

    const testStage = pipeline.addStage('SmokeTest');
    testStage.addActions(new cicd.ShellScriptAction({
      actionName: 'SmokeTest',
      commands: [
        'curl -Ssf $WEBSITE_URL',
        'curl -Ssf $API_URL',
      ],
      useOutputs: {
        API_URL: pipeline.stackOutput(prodApplication.application.apiUrl),
        WEBSITE_URL: pipeline.stackOutput(prodApplication.application.websiteUrl),
      },
    }));
  }
}
