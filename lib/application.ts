import * as cdk from '@aws-cdk/core';
import { Api } from './api';
import { Frontend } from './frontend';

export interface ApplicationProps {
  hostedZoneId: string
  hostedZoneName: string
  apiDomain: string
  websiteDomain: string
  stage: string
}

export class Application extends cdk.Construct {
  readonly apiUrl: cdk.CfnOutput;
  readonly websiteUrl: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props: ApplicationProps) {
    super(scope, id);

    const {
      stage,
    } = props;

    const {
      hostedZoneId,
      hostedZoneName,
      apiDomain,
      websiteDomain,
    } = props;

    const api = new Api(this, 'Api', {
      hostedZoneId,
      hostedZoneName,
      domainName: apiDomain,
      allowedOrigin: `https://${websiteDomain}`,
    });
    this.apiUrl = api.apiUrl;

    const frontend = new Frontend(this, 'Frontend', {
      hostedZoneId,
      hostedZoneName,
      domainName: websiteDomain,
    });
    this.websiteUrl = frontend.websiteUrl;
  }
}
