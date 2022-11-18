import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { S3EventSource, SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { QaReportStackProps } from '../interfaces/stack';

export class QAReportPocStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: QaReportStackProps) {
        super(scope, id, props);

        const vpc = Vpc.fromLookup(this, 'QaReportVPC', { vpcId: props?.vpcId });

        const dbSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'dbSecutiryGroup', 'sg-055bb47a2d144363b');
        const reportBucket = new Bucket(this, 'ReportBucket', {
            bucketName: 'qa-federico-report-poc-bucket',
            publicReadAccess: true,
        });

        const qaReportQueue = new Queue(this, 'QAReportPocQueue', {
            visibilityTimeout: Duration.seconds(30), // default,
            receiveMessageWaitTime: Duration.seconds(20), // default
        });

        const s3PutEventSource = new S3EventSource(reportBucket, {
            events: [EventType.OBJECT_CREATED_PUT],
            filters: [
                {
                    prefix: props?.cucumberPrefix,
                },
            ],
        });

        const sqsEventSource = new SqsEventSource(qaReportQueue, {
            reportBatchItemFailures: true,
        });

        const cucumberFormatLambda = new NodejsFunction(this, 'report-cucumber-format-handler', {
            entry: '../../services/cucumber-format-lambda/src/index.ts',
            runtime: Runtime.NODEJS_16_X,
            architecture: Architecture.ARM_64,
            environment: {
                SNS_QUEUE_URL: qaReportQueue.queueUrl,
            },
            vpc,
            events: [s3PutEventSource],
        });

        const persistenceLambda = new NodejsFunction(this, 'report-persistence-handler', {
            entry: '../../services/persistence-lambda/src/index.ts',
            runtime: Runtime.NODEJS_16_X,
            architecture: Architecture.ARM_64,
            vpc,
            securityGroups: [dbSecurityGroup],
            environment: {
                DB_HOST: props?.dbHost,
                DB_PORT: props?.dbPort,
                DB_USERNAME: props?.dbUsername,
                DB_PASSWORD: props?.dbPassword,
                DB_NAME: props?.dbName,
            },
            events: [sqsEventSource],
        });

        qaReportQueue.grantSendMessages(cucumberFormatLambda);
    }
}
