import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { connPool } from 'index';
import { Report } from 'interface';
import { PoolConnection } from 'mysql';
import { DatabaseError } from 'utils';

const persistEpics = (report: Report, connection: PoolConnection) => {
    const insertEpicsSql = 'INSERT INTO epics (id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return new Promise((resolve, reject) => {
        connection.query(insertEpicsSql, [report.epics.map((epic) => [epic.id, epic.supersede])], (err) => {
            if (err) {
                lambdaLogger.error('Error inserting epics', { err });
                return reject(new DatabaseError('Error inserting epics'));
            }
        });
    });
};

const persistStories = (report: Report, connection: PoolConnection) => {
    const insertStoriesSql = 'INSERT INTO stories (id, epic_id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return new Promise((resolve, reject) => {
        connection.query(insertStoriesSql, [report.stories.map((story) => [story.id, story.epicId, story.supersede])], (err) => {
            if (err) {
                lambdaLogger.error('Error inserting stories', { err });
                return reject(new DatabaseError('Error inserting stories'));
            }
        });
    });
};

export const persistToDb = (report: Report) => {
    return new Promise((resolve: (value: unknown) => void, reject: (obj: unknown) => void) => {
        connPool.getConnection((err, connection) => {
            if (err) {
                lambdaLogger.error('Error getting connection', { err });
                return reject(new DatabaseError('Error getting connection'));
            }

            connection.beginTransaction((err) => {
                if (err) {
                    lambdaLogger.error('Error starting transaction', { err });
                    return reject(new DatabaseError('Error starting transaction'));
                }

                Promise.all([persistEpics(report, connection), persistStories(report, connection)])
                    .then(() => {
                        connection.commit((err) => {
                            if (err) {
                                lambdaLogger.error('Error committing transaction', { err });
                                return reject(new DatabaseError('Error committing transaction'));
                            }
                            connection.release();
                            return resolve(true);
                        });
                    })
                    .catch(() => {
                        connection.rollback((err) => {
                            if (err) {
                                lambdaLogger.error('Error rolling back transaction', { err });
                                return reject(new DatabaseError('Error rolling back transaction'));
                            }

                            connection.release();
                            return reject(err);
                        });
                    });
            });
        });
    });
};
