import { GetReportFromBucket } from 'interface';
import { S3 } from 'aws-sdk';
import { Body } from 'aws-sdk/clients/s3';
import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';

const s3 = new S3({ apiVersion: '2006-03-01' });

export const getReportFromBucket = async ({ bucketName, key }: GetReportFromBucket): Promise<Body> => {
    lambdaLogger.info('Getting report from bucket');

    const { ContentType, Body } = await s3
        .getObject({
            Bucket: bucketName,
            Key: key,
        })
        .promise();

    lambdaLogger.info('Received content type', { ContentType });

    if (!Body) throw new Error('No file found');
    return Body;
};
