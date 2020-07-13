#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Repository } from '../lib/repository';
import { Pipeline } from '../lib/pipeline';
import { Application } from '../lib/application';
import { Frontend } from '../lib/frontend';

const app = new cdk.App();
new Repository(app, 'Repository');
new Pipeline(app, 'Pipeline');
new Application(app, 'Application');
new Frontend(app, 'Frontend');
