import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as iam from '@aws-cdk/aws-iam';
import * as route53 from '@aws-cdk/aws-route53';
import * as targets from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deploy from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';

export interface FrontendProps extends cdk.StageProps {
  hostedZoneId: string
  hostedZoneName: string
  domainName: string
}

export class Frontend extends cdk.Stack {
  readonly websiteUrl: cdk.CfnOutput;

  constructor(scope: cdk.Construct, id: string, props: FrontendProps) {
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
      region: 'us-east-1',
      domainName,
      hostedZone,
    });

    const oai = new cloudfront.OriginAccessIdentity(this, 'OriginAccessIdentity');

    const websiteBucket = new s3.Bucket(this, 'WebsiteBucket');
    websiteBucket.addToResourcePolicy(new iam.PolicyStatement({
      principals: [
        new iam.CanonicalUserPrincipal(oai.cloudFrontOriginAccessIdentityS3CanonicalUserId),
      ],
      actions: [
        's3:GetBucket*',
        's3:GetObject*',
        's3:List*',
      ],
      effect: iam.Effect.ALLOW,
      resources: [
        websiteBucket.bucketArn,
        websiteBucket.arnForObjects('*'),
      ],
    }));

    const distribution = new cloudfront.CloudFrontWebDistribution(this, 'Distribution', {
      defaultRootObject: 'index.html',
      errorConfigurations: [
        {
          errorCode: 404,
          responseCode: 200,
          responsePagePath: '/index.html'
        },
      ],
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: websiteBucket,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              allowedMethods: cloudfront.CloudFrontAllowedMethods.GET_HEAD,
              cachedMethods: cloudfront.CloudFrontAllowedCachedMethods.GET_HEAD,
              forwardedValues: {
                queryString: false,
                cookies: {
                  forward: 'none',
                },
              },
              isDefaultBehavior: true,
            },
          ],
        },
      ],
      viewerCertificate: cloudfront.ViewerCertificate.fromAcmCertificate(
        certificate,
        {
          aliases: [
            domainName,
          ],
        },
      ),
      viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    });

    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [
        s3deploy.Source.asset('./website', {
          bundling: {
            image: cdk.BundlingDockerImage.fromAsset('node_modules/@aws-cdk/aws-lambda-nodejs/parcel'),
            command: [
              'npx', 'parcel', 'build', 'index.html', '--out-dir', '/asset-output',
            ],
          },
        }),
      ],
      destinationBucket: websiteBucket,
      distribution,
      distributionPaths: ['/index.html'],
      prune: false,
    });

    new route53.ARecord(this, 'AliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(new targets.CloudFrontTarget(distribution)),
    });

    this.websiteUrl = new cdk.CfnOutput(this, 'WebsiteUrl', {
      value: `https://${domainName}`,
    });
  }
}
