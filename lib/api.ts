import * as path from 'path'
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';

// TODO: Remove this once it is supported upstream:
// https://github.com/aws/aws-cdk/issues/8941
class ApiGatewayDomain implements route53.IAliasRecordTarget {
  constructor(private readonly domainName: apigwv2.IDomainName) { }

  public bind(_record: route53.IRecordSet): route53.AliasRecordTargetConfig {
    return {
      dnsName: this.domainName.regionalDomainName,
      hostedZoneId: this.domainName.regionalHostedZoneId,
    };
  }
}

export interface ApiProps extends cdk.StageProps {
  hostedZoneId: string
  hostedZoneName: string
  domainName: string
}

export class Api extends cdk.Stack {
  readonly apiUrl: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props: ApiProps) {
    super(scope, id, props);

    const {
      hostedZoneId,
      hostedZoneName: zoneName,
      domainName,
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
      defaultIntegration: new apigwv2.LambdaProxyIntegration({
        handler: new lambda.NodejsFunction(this, 'NodejsFunction', {
          entry: path.resolve(__dirname, 'api.handler.ts'),
        }),
      }),
      defaultDomainMapping: {
        domainName: customDomain,
        // TODO: should be '/' according to docs. Bug?
        mappingKey: '',
      },
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'api',
      target: route53.RecordTarget.fromAlias(new ApiGatewayDomain(customDomain)),
    });
  }
}
