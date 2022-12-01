import * as cdk from 'aws-cdk-lib';
import { Duration } from 'aws-cdk-lib';
import { Port, SecurityGroup, Vpc } from 'aws-cdk-lib/aws-ec2';
import { Architecture, Runtime } from 'aws-cdk-lib/aws-lambda';
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Bucket, EventType } from 'aws-cdk-lib/aws-s3';
import { Queue } from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { QaReportStackProps } from '../interfaces/stack';
import * as s3n from 'aws-cdk-lib/aws-s3-notifications';

export class QAReportPocStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props: QaReportStackProps) {
        super(scope, id, props);

        const vpc = Vpc.fromLookup(this, 'QaReportVPC', { vpcId: props?.vpcId });

        const dbSecurityGroup = SecurityGroup.fromSecurityGroupId(this, 'dbSeecurityGroup', 'sg-055bb47a2d144363b');

        const persistenceLambdaSecurityGroup = new SecurityGroup(this, 'PersistenceLambdaSecurityGroup', {
            vpc,
        });

        const reportBucket = Bucket.fromBucketName(this, 'ReportBucket', 'qa-federico-report-poc-bucket');
        const screenshotBucket = new Bucket(this, 'ScreenshotBucket', {
            bucketName: props?.screenshotPath,
        });

        const qaReportQueue = new Queue(this, 'QAReportPocQueue', {
            visibilityTimeout: Duration.seconds(30), // default,
            receiveMessageWaitTime: Duration.seconds(20), // default
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
                SCREENSHOT_PATH: screenshotBucket.bucketName,
            },
            timeout: Duration.seconds(props.formatLambdaTimeout),
            vpc,
        });

        new NodejsFunction(this, 'report-persistence-handler', {
            entry: '../../services/persistence-lambda/src/index.ts',
            runtime: Runtime.NODEJS_16_X,
            architecture: Architecture.ARM_64,
            vpc,
            securityGroups: [persistenceLambdaSecurityGroup],
            environment: {
                DB_HOST: props?.dbHost,
                DB_PORT: props?.dbPort,
                DB_USERNAME: props?.dbUsername,
                DB_PASSWORD: props?.dbPassword,
                DB_NAME: props?.dbName,
            },
            timeout: Duration.seconds(props.persistenceLambdaTimeout),
            events: [sqsEventSource],
        });

        dbSecurityGroup.addIngressRule(persistenceLambdaSecurityGroup, Port.tcp(parseInt(props.dbPort)), 'Lambda to Postgres database');

        qaReportQueue.grantSendMessages(cucumberFormatLambda);

        reportBucket.addEventNotification(EventType.OBJECT_CREATED, new s3n.LambdaDestination(cucumberFormatLambda), {
            prefix: props.cucumberPrefix,
        });
        reportBucket.grantRead(cucumberFormatLambda);
        screenshotBucket.grantPut(cucumberFormatLambda);
        screenshotBucket.grantWrite(cucumberFormatLambda);
    }
}
