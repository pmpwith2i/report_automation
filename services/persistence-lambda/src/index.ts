import { withRequest } from '@packages/lambda-logger';
import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { Context, SQSEvent } from 'aws-lambda';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USERNAME } from './constants';
import mysql from 'mysql';
import { persistToDb } from 'strategy';
import { validateReport } from 'validation';
import Joi from 'joi';

export const connPool = mysql.createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
    port: parseInt(DB_PORT),
});

export const handler = async (event: SQSEvent, context: Context): Promise<boolean> => {
    try {
        withRequest(event, context);
        context.callbackWaitsForEmptyEventLoop = false;

        lambdaLogger.info('Received records', { recordsNumber: event.Records.length });

        for (const record of event.Records) {
            const reports = validateReport(JSON.parse(record.body ?? {}));
            for (const report of reports) await persistToDb(report);
        }

        lambdaLogger.info('Records persisted to DB');
        return true;
    } catch (error: unknown) {
        if (error instanceof Joi.ValidationError) {
            lambdaLogger.error('Validation error', { error });
            return false;
        }

        lambdaLogger.error('Error', { error });
    }
    return true;
};
