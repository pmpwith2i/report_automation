import { GetReportFromBucket } from 'interface';
import { S3 } from 'aws-sdk';
import { Body } from 'aws-sdk/clients/s3';
import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { S3Error } from 'utils';

const s3 = new S3({ apiVersion: '2006-03-01' });

export const getReportFromBucket = async ({ bucketName, key }: GetReportFromBucket): Promise<Body> => {
    lambdaLogger.info('Getting report from bucket');
    const { Body } = await s3
        .getObject({
            Bucket: bucketName,
            Key: key,
        })
        .promise();

    if (!Body) throw new S3Error('File not found');
    return Body;
};
