import { withRequest } from '@packages/lambda-logger';
import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { Context, SQSEvent } from 'aws-lambda';
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USERNAME } from './constants';
import mysql from 'mysql';

const connPool = mysql.createPool({
    host: DB_HOST,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    database: DB_NAME,
});

export const handler = (event: SQSEvent, context: Context) => {
    try {
        withRequest(event, context);
        context.callbackWaitsForEmptyEventLoop = false;

        lambdaLogger.info('Received event', { event });

        lambdaLogger.info('Trying to init connection');
        connPool.getConnection((err, connection) => {
            if (err) {
                lambdaLogger.error('Error getting connection', { err });
                throw err;
            }

            connection.query('select * from qa_test', (error, results) => {
                connection.release();
                if (error) {
                    lambdaLogger.error('Error query get', { error });
                } else {
                    lambdaLogger.info('returned results', { results });
                }
            });
        });
    } catch (error: unknown) {
        lambdaLogger.error('Error', { error });

        return false;
    }
};
