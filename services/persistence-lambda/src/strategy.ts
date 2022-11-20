import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { connPool } from 'index';
import { DatabaseError } from 'utils';

export const persistToDb = () => {
    return new Promise((resolve: (obj: unknown) => void, reject: (obj: unknown) => void) => {
        connPool.getConnection((err, connection) => {
            if (err) {
                lambdaLogger.error('Error getting connection', { err });
                return reject(new DatabaseError('Error getting connection'));
            }

            connection.query('select * from qa_test', (error, results) => {
                connection.release();
                if (error) {
                    return reject(new DatabaseError(error.message));
                }
                return resolve(results);
            });
        });
    });
};
