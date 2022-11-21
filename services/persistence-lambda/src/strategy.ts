import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { connPool } from 'index';
import { Report } from 'interface';
import { DatabaseError } from 'utils';

export const persistToDb = (report: Report) => {
    return new Promise((resolve: (obj: unknown) => void, reject: (obj: unknown) => void) => {
        connPool.getConnection((err, connection) => {
            if (err) {
                lambdaLogger.error('Error getting connection', { err });
                return reject(new DatabaseError('Error getting connection'));
            }

            const insertEpicsSql = 'INSERT INTO epics (id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
            connection.query(insertEpicsSql, [report.epics.map((epic) => [epic.id, epic.supersede])], (err) => {
                if (err) {
                    lambdaLogger.error('Error inserting epics', { err });
                    return reject(new DatabaseError('Error inserting epics'));
                }
            });
        });
    });
};
