import { withRequest } from '@packages/lambda-logger';
import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { Context, S3Event } from 'aws-lambda';
import { SQS } from 'aws-sdk';
import { SendMessageRequest } from 'aws-sdk/clients/sqs';
import { SNS_QUEUE_URL } from './constants';
import { getReportFromBucket } from 'strategy';
import { formatExecutionReport, S3Error } from 'utils';
import { parseBlob, validateExecutionReport } from 'validation';
import Joi from 'joi';
import { ExecutionReport, FinalReport } from 'interface';
import { Body } from 'aws-sdk/clients/s3';

const sqs = new SQS({ apiVersion: 'latest' });

export const handler = async (event: S3Event, context: Context): Promise<boolean> => {
    try {
        withRequest(event, context);

        if (event.Records?.length === 0) throw new Error('No records provided');

        const bucketName = event.Records[0].s3.bucket.name;
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

        lambdaLogger.info('Received object', { bucketName, key });

        const blob: Body = await getReportFromBucket({ bucketName, key });
        const jsonObj: JSON = parseBlob(blob.toString());

        const executionReport: ExecutionReport = validateExecutionReport(jsonObj);
        const formattedJson: FinalReport = formatExecutionReport(executionReport);

        lambdaLogger.info(`Sendind message to queue -> ${SNS_QUEUE_URL}`);

        const params: SendMessageRequest = {
            MessageBody: JSON.stringify(formattedJson),
            QueueUrl: SNS_QUEUE_URL,
        };

        await sqs.sendMessage(params).promise();
        return true;
    } catch (error: unknown) {
        if (error instanceof Joi.ValidationError) {
            lambdaLogger.error('Validation Error', { error });
            return false;
        }

        if (error instanceof S3Error) {
            lambdaLogger.error('S3Error', { error });
            return false;
        }

        lambdaLogger.error('Undefined Error', { error });
        return false;
    }
};
