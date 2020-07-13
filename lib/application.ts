import * as acm from '@aws-cdk/aws-certificatemanager';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2';
import * as lambda from '@aws-cdk/aws-lambda-nodejs';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as cdk from '@aws-cdk/core';

// TODO: not supported yet
class ApiGatewayDomain implements route53.IAliasRecordTarget {
  constructor(private readonly domainName: apigwv2.IDomainName) { }

  public bind(_record: route53.IRecordSet): route53.AliasRecordTargetConfig {
    return {
      dnsName: this.domainName.regionalDomainName,
      hostedZoneId: this.domainName.regionalHostedZoneId,
    };
  }
}

export class Application extends cdk.Stage {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StageProps) {
    super(scope, id, props);

    const zoneName = 'christophgys.in';

    /*
    const hostedZone = route53.HostedZone.fromLookup(this, 'HostedZone', {
      domainName: zoneName,
    });
    */
    const hostedZoneId = 'Z05148064CT4NI5ZG6SS';
    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'HostedZone', {
      zoneName,
      hostedZoneId,
    });

    const apiDomainName = `api.${zoneName}`;

    /*
    const certificate = new acm.DnsValidatedCertificate(this, 'Certificate', {
      domainName: apiDomainName,
      hostedZone,
    });

    const domainName = new apigwv2.DomainName(this, 'DomainName', {
      domainName: apiDomainName,
      certificate,
    });

    const api = new apigwv2.HttpApi(this, 'HttpApi', {
      defaultIntegration: new apigwv2.LambdaProxyIntegration({
        handler: new lambda.NodejsFunction(this, 'api'),
      }),
      defaultDomainMapping: {
        domainName,
        // TODO: should be '/' according to docs. Bug?
        mappingKey: '',
      },
    });

    new cdk.CfnOutput(this, 'ApiUrl', {
      // value: api.url!,
      value: `https://${apiDomainName}`,
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      recordName: 'api',
      target: route53.RecordTarget.fromAlias(new ApiGatewayDomain(domainName)),
    });
    */
  }
}
