#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Repository } from '../lib/repository';
import { Pipeline } from '../lib/pipeline';
import { Api } from '../lib/api';
import { Frontend } from '../lib/frontend';
import { config } from 'dotenv';

config();

const {
  HOSTED_ZONE_ID,
  HOSTED_ZONE_NAME,
  API_DOMAIN,
  WEBSITE_DOMAIN,
  REPOSITORY_NAME,
} = process.env;

const hostedZoneId = HOSTED_ZONE_ID!;
const hostedZoneName = HOSTED_ZONE_NAME!;
const apiDomain = API_DOMAIN!;
const websiteDomain = WEBSITE_DOMAIN!;
const repositoryName = REPOSITORY_NAME!;

const repositoryProps = {
  repositoryName,
};

const apiProps = {
  hostedZoneId,
  hostedZoneName,
  domainName: apiDomain,
  allowedOrigin: `https://${websiteDomain}`,
};

const frontendProps = {
  hostedZoneId,
  hostedZoneName,
  domainName: websiteDomain,
};

const app = new cdk.App();
new Repository(app, 'Repository', repositoryProps);
new Pipeline(app, 'Pipeline', {
  repositoryProps,
  applicationProps: {
    apiProps,
    frontendProps,
  },
});
new Api(app, 'Api', apiProps);
new Frontend(app, 'Frontend', frontendProps);
