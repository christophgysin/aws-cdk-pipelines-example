import * as path from 'path'
import * as fs from 'fs'
import * as acm from '@aws-cdk/aws-certificatemanager';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda';
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

    const lambdaFile = path.resolve(__dirname, 'api.handler.js');
    const lambdaCode = fs.readFileSync(lambdaFile, 'utf-8');

    const api = new apigwv2.HttpApi(this, 'HttpApi', {
      defaultIntegration: new apigwv2.LambdaProxyIntegration({
        // TODO: Doesn't work in pipeline. Bug?
        // handler: new lambda.NodejsFunction(this, 'handler')
        handler: new lambda.Function(this, 'Function', {
          runtime: lambda.Runtime.NODEJS_12_X,
          handler: 'index.handler',
          code: lambda.Code.fromInline(lambdaCode),
          environment: {
            ALLOWED_ORIGIN: allowedOrigin,
          },
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
