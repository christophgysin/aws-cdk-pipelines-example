# AWS CDK pipelines example

## Setup


This repository contains an example CDK pipeline that deployes a simple
serverless API and a static frontend served from CloudFront. Once deployed, the
pipeline will update itself on git push.

Create a repository on github, and a personal access token with scopes repo and
admin:repo_hook. Store the secret in AWS SecretsManager:

    $ aws secretsmanager create-secret --name github-token --secret-string=<TOKEN>

Push the code to the repo. When the pipeline is deployed, it will automatically
update itself to the state in that repository.

```
$ npm ci
$ npm run bootstrap
$ npm run build+deploy Pipeline
```

## Stacks

### Pipeline

The Pipeline that updates itself, deploys assets and all Application
stacks.

### Application

Contains two stacks:

#### API

A simple serverless API, accessible on a custom domain.

#### Frontend

A CloudFront distribution that serves the contents of the dist/ folder
in this repository from an S3 bucket via an OriginAccessIdentity, and
automatically invalidates the distribution on updates.
