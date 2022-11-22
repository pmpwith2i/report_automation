import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { PoolConnection } from 'mysql';

export class DatabaseError extends Error {}

export const execQueryPromise = (connection: PoolConnection, sql: string, values?: unknown[]) =>
    new Promise((resolve, reject) => {
        lambdaLogger.info('Executing query', { sql });
        connection.query(sql, values, (err: unknown) => {
            if (err) {
                lambdaLogger.error('Error inserting tests', { err });
                return reject(new DatabaseError('Error inserting tests'));
            }

            return resolve(true);
        });
    });
