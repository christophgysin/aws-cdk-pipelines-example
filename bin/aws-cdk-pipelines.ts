#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
import { Repository } from '../lib/repository';
import { Pipeline } from '../lib/pipeline';

const app = new cdk.App();
new Repository(app, 'Repository');
new Pipeline(app, 'Pipeline');
