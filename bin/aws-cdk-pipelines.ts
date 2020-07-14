#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Repository } from '../lib/repository';
import { Pipeline } from '../lib/pipeline';
import { Api } from '../lib/api';
import { Frontend } from '../lib/frontend';

const hostedZoneId = 'Z05148064CT4NI5ZG6SS';
const hostedZoneName = 'christophgys.in';
const apiDomain = 'api.christophgys.in';
const websiteDomain = 'christophgys.in';

const apiProps = {
  hostedZoneId,
  hostedZoneName,
  domainName: apiDomain,
};

const frontendProps = {
  hostedZoneId,
  hostedZoneName,
  domainName: websiteDomain,
};

const app = new cdk.App();
new Repository(app, 'Repository');
new Pipeline(app, 'Pipeline', {
  apiProps,
  frontendProps,
});
new Api(app, 'Api', apiProps);
new Frontend(app, 'Frontend', frontendProps);
