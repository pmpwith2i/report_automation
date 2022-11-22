import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { connPool } from 'index';
import { ReportExecution } from 'interface';
import { PoolConnection } from 'mysql';
import { DatabaseError, execQueryPromise } from 'utils';

const persistEnvironment = (report: ReportExecution, connection: PoolConnection) => {
    const { environment } = report.execution;
    const insertEnvironmentSql = `INSERT INTO environments (id) VALUES (?) `;
    return execQueryPromise(connection, insertEnvironmentSql, [[environment]]);
};

const persistExecution = (report: ReportExecution, connection: PoolConnection) => {
    const { timestamp, environment } = report.execution;
    const insertExecutionSql = `INSERT INTO executions (timestamp, env_id) VALUES (?)`;
    return execQueryPromise(connection, insertExecutionSql, [[timestamp, environment]]);
};

const persistEpics = (report: ReportExecution, connection: PoolConnection) => {
    const insertEpicsSql = 'INSERT INTO epics (id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertEpicsSql, [report.features.map((feature) => [feature.epic.id, feature.epic.supersede])]);
};

const persistStories = (report: ReportExecution, connection: PoolConnection) => {
    const insertStoriesSql = 'INSERT INTO stories (id, epic_id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertStoriesSql, [report.features.map((feature) => [feature.story.id, feature.epic.id, feature.story.supersede])]);
};

const persistTests = (report: ReportExecution, connection: PoolConnection) => {
    const insertTestsSql = 'INSERT INTO tests (id, story_id, supersede) VALUES ? ON DUPLICATE KEY UPDATE supersede = VALUES(supersede)';
    return execQueryPromise(connection, insertTestsSql, [
        report.features.map((feature) => feature.tests.map((test) => [test.id, feature.story.id, test.supersede])).flat(),
    ]);
};

const persistResults = (report: ReportExecution, connection: PoolConnection) => {
    const insertExecutionsSql = 'INSERT INTO executions_results (execution_id, test_id, result, step, stacktrace, screenshot) VALUES ?';
    const results = [
        report.features
            .map((feature) =>
                feature.results.map((result) => [
                    `${report.execution.environment}_${report.execution.timestamp}`,
                    result.test.id,
                    result.status,
                    result.failure?.step,
                    result.failure?.stacktrace,
                    result.failure?.screenshot,
                ]),
            )
            .flat(),
    ];
    lambdaLogger.info('Persisting results', { results });
    return execQueryPromise(connection, insertExecutionsSql, results);
};

export const persistReportToDb = (report: ReportExecution) => {
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
                    persistEnvironment(report, connection),
                    persistExecution(report, connection),
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
