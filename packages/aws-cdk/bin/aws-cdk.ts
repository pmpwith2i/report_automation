#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QAReportPocStack } from '../lib/qa-report-poc-stack';
import { QaReportStackProps } from '../interfaces/stack';

const app = new cdk.App();

const props: QaReportStackProps = {
    env: {
        account: process.env.CDK_AWS_ACCOUNT_ID ?? '',
        region: process.env.CDK_AWS_REGION ?? '',
    },
    vpcId: process.env.CDK_VPC_ID ?? '',
    screenshotPath: process.env.SCREENSHOT_PATH ?? '',
    cucumberPrefix: process.env.CDK_STORAGE_CUCUMBER_PREFIX ?? 'cucumber/',
    dbHost: process.env.DB_HOST ?? '',
    dbPort: process.env.DB_PORT ?? '',
    dbUsername: process.env.DB_USERNAME ?? '',
    dbPassword: process.env.DB_PASSWORD ?? '',
    dbName: process.env.DB_NAME ?? '',
    persistenceLambdaTimeout: parseInt(process.env.PERSISTENCE_LAMBDA_TIMEOUT ?? '30'),
    formatLambdaTimeout: parseInt(process.env.FORMAT_LAMBDA_TIMEOUT ?? '60'),
};

new QAReportPocStack(app, 'QaReportAutomaticStack', props);
