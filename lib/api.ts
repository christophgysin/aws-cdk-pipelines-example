import * as acm from '@aws-cdk/aws-certificatemanager';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';
import * as integrations from '@aws-cdk/aws-apigatewayv2-integrations';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';

export interface ApiProps extends cdk.StageProps {
  hostedZoneId: string
  hostedZoneName: string
  domainName: string
  allowedOrigin: string
}

export class Api extends cdk.Stack {
  readonly apiUrl: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props: ApiProps) {
    super(scope, id, props);

    const {
      hostedZoneId,
      hostedZoneName: zoneName,
      domainName,
      allowedOrigin,
    } = props;

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      zoneName,
      hostedZoneId,
    });

    const certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName,
      hostedZone,
    });

    const customDomain = new apigwv2.DomainName(this, 'DomainName', {
      domainName,
      certificate,
    });

    this.apiUrl = new cdk.CfnOutput(this, 'ApiUrl', {
      // value: api.url!,
      value: `https://${domainName}`,
    });

    const api = new apigwv2.HttpApi(this, 'HttpApi', {
      defaultIntegration: new integrations.LambdaProxyIntegration({
        handler: new lambda.NodejsFunction(this, 'handler', {
          environment: {
            ALLOWED_ORIGIN: allowedOrigin,
          },
        }),
      }),
      defaultDomainMapping: {
        domainName: customDomain,
      },
    });

    // TODO: dependency not added by CDK. Bug?
    api.node.addDependency(customDomain)

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'api',
      target: route53.RecordTarget.fromAlias(new targets.ApiGatewayv2Domain(customDomain)),
    });
  }
}
