import pino from 'pino';
import { lambdaRequestTracker, pinoLambdaDestination } from 'pino-lambda';

export type LOG_LEVEL = 'info' | 'debug' | 'error' | 'trace';
// custom destination formatter
const destination = pinoLambdaDestination();

const logger = pino(
    {
        // typical pino options
    },
    destination,
);

export const withRequest = lambdaRequestTracker();
logger.info('');
export default {
    info: (message: string, data?: unknown) => logger.info({ data }, message),
    debug: (message: string, data?: unknown) => logger.debug({ data }, message),
    error: (message: string, data?: unknown) => logger.error({ data }, message),
};
