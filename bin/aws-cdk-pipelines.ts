#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Pipeline } from '../lib/pipeline';
import { Application } from '../lib/application';
import { config } from 'dotenv';

config();

const {
  HOSTED_ZONE_ID,
  HOSTED_ZONE_NAME,
  API_DOMAIN,
  WEBSITE_DOMAIN,
  REPOSITORY_OWNER,
  REPOSITORY_NAME,
} = process.env;

const hostedZoneId = HOSTED_ZONE_ID!;
const hostedZoneName = HOSTED_ZONE_NAME!;
const apiDomain = API_DOMAIN!;
const websiteDomain = WEBSITE_DOMAIN!;
const owner = REPOSITORY_OWNER!;
const repo = REPOSITORY_NAME!;

const repositoryProps = {
  owner,
  repo,
};

const applicationProps = {
  hostedZoneId,
  hostedZoneName,
  apiDomain,
  websiteDomain,
};

const app = new cdk.App();
new Application(app, 'Application', {
  ...applicationProps,
  stage: 'dev',
})
new Pipeline(app, 'Pipeline', {
  repositoryProps,
  applicationProps,
});
