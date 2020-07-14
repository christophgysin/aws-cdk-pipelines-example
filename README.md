# AWS CDK pipelines example

## Setup

This repository contains an example CDK pipeline that deployes a simple
serverless API and a static frontend served from CloudFront. Once deployed, the
pipeline will update itself on git push.

The repository needs to be deployed first, and the code pushed to its master
branch. When the pipeline is deployed, it will automatically update itself to
the state in that repository.

```
$ npm ci
$ npm run bootstrap
$ npm run build+deploy Repository
$ git remote add origin <Repository-URL>
$ git push
$ npm run deploy Pipeline
```

## Stacks

### Repository

Contains a CodeCommit repository, needed for bootstrapping.

### Pipeline

Contains the Pipeline that updates itself, deploys assets and all Application
stacks.

### Application

Contains a simple serverless API, accessible on a custom domain.

### Frontend

Contains a CloudFront distribution that serves the contents of the dist/ folder
in this repository from an S3 bucket via an OriginAccessIdentity, and
automatically invalidates the distribution on updates.
