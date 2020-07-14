#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Repository } from '../lib/repository';
import { Pipeline } from '../lib/pipeline';
import { Api } from '../lib/api';
import { Frontend } from '../lib/frontend';

const app = new cdk.App();
new Repository(app, 'Repository');
new Pipeline(app, 'Pipeline');
new Api(app, 'Api');
new Frontend(app, 'Frontend');
