import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { connPool } from 'index';
import { Report } from 'interface';
import { PoolConnection } from 'mysql';
import { DatabaseError, execQueryPromise } from 'utils';

const persistEpics = (report: Report, connection: PoolConnection) => {
    const insertEpicsSql = 'INSERT INTO epic (id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertEpicsSql, [report.epics.map((epic) => [epic.id, epic.supersede])]);
};

const persistStories = (report: Report, connection: PoolConnection) => {
    const insertStoriesSql = 'INSERT INTO story (id, epic_id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertStoriesSql, [report.stories.map((story) => [story.id, story.epicId, story.supersede])]);
};

const persistTests = (report: Report, connection: PoolConnection) => {
    const insertTestsSql = 'INSERT INTO test (id, story_id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertTestsSql, [report.tests.map((test) => [test.id, test.storyId, test.supersede])]);
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

                Promise.all([persistEpics(report, connection), persistStories(report, connection), persistTests(report, connection)])
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
