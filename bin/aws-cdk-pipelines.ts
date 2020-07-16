#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Repository } from '../lib/repository';
import { Pipeline } from '../lib/pipeline';
import { Application } from '../lib/application';
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

const applicationProps = {
  hostedZoneId,
  hostedZoneName,
  apiDomain,
  websiteDomain,
};

const app = new cdk.App();
new Repository(app, 'Repository', repositoryProps);
new Application(app, 'Application', applicationProps)
new Pipeline(app, 'Pipeline', {
  repositoryProps,
  applicationProps,
});
