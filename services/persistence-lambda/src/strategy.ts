import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { connPool } from 'index';
import { Report } from 'interface';
import { PoolConnection } from 'mysql';
import { DatabaseError, execQueryPromise } from 'utils';

const persistEpics = (report: Report, connection: PoolConnection) => {
    const insertEpicsSql = 'INSERT INTO epic (id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertEpicsSql, [report.results.map((result) => [result.epic.id, result.epic.supersede])]);
};

const persistStories = (report: Report, connection: PoolConnection) => {
    const insertStoriesSql = 'INSERT INTO story (id, epic_id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertStoriesSql, [report.results.map((result) => [result.story.id, result.epic.id, result.story.supersede])]);
};

const persistTests = (report: Report, connection: PoolConnection) => {
    const insertTestsSql = 'INSERT INTO test (id, story_id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertTestsSql, [report.results.map((result) => [result.test.id, result.story.id, result.test.supersede])]);
};

const persistResults = (report: Report, connection: PoolConnection) => {
    const insertExecutionsSql = 'INSERT INTO execution (id, timestamp, environment result, test_id) VALUES ?';
    return execQueryPromise(connection, insertExecutionsSql, [
        report.results.map((result) => [result.execution.id, result.execution.timestamp, result.execution.environment, result.result, result.test.id]),
    ]);
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

                Promise.all([
                    persistEpics(report, connection),
                    persistStories(report, connection),
                    persistTests(report, connection),
                    persistResults(report, connection),
                ])
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
