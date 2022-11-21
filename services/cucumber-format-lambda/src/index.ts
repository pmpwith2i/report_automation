import { withRequest } from '@packages/lambda-logger';
import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { Context, S3Event } from 'aws-lambda';
import { SQS } from 'aws-sdk';
import { SendMessageRequest } from 'aws-sdk/clients/sqs';
import { SNS_QUEUE_URL } from './constants';
import { getReportFromBucket } from 'strategy';
import { formatCucumberReport, ValidationError } from 'utils';
import { parseBlob, validateCucumberReport } from 'validation';

const sqs = new SQS({ apiVersion: 'latest' });

export const handler = async (event: S3Event, context: Context): Promise<boolean> => {
    try {
        withRequest(event, context);

        lambdaLogger.info('Received event', { event });

        if (event.Records?.length === 0) throw new Error('No records provided');

        const bucketName = event.Records[0].s3.bucket.name;
        const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' '));

        lambdaLogger.info('Received new object', { bucketName, key });

        const blob = await getReportFromBucket({ bucketName, key });
        const jsonObj = parseBlob(blob.toString());

        const cucumberReport = validateCucumberReport(jsonObj);

        lambdaLogger.info('Received report is valid');

        const finalReport = formatCucumberReport(cucumberReport);

        lambdaLogger.info('Report formatted', { finalReport });

        lambdaLogger.info(`Sendind message to queue -> ${SNS_QUEUE_URL}`);

        const params: SendMessageRequest = {
            MessageBody: JSON.stringify(finalReport),
            QueueUrl: SNS_QUEUE_URL,
        };

        await sqs.sendMessage(params).promise();
        return true;
    } catch (error: unknown) {
        if (error instanceof ValidationError) {
            lambdaLogger.error('Validation Error', { message: error.message });
        }

        lambdaLogger.error('Error', { error });
    }

    return false;
};
