import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { CucumberReport } from 'interface';
import Joi from 'joi';

const tagSschema = Joi.array().items(
    Joi.object({
        name: Joi.string(),
        line: Joi.number(),
    }),
);

const stepsSchema = Joi.array().items(
    Joi.object({
        keyword: Joi.string(),
        line: Joi.number(),
        name: Joi.string(),
        result: Joi.object({ status: Joi.string() }),
    }),
);

const elementsSchema = Joi.array().items(
    Joi.object({
        id: Joi.string(),
        keyword: Joi.string(),
        name: Joi.string(),
        tags: tagSschema,
        steps: stepsSchema,
    }),
);

const cucumberSchema = Joi.array().items(
    Joi.object({
        keyword: Joi.string(),
        name: Joi.string(),
        line: Joi.number(),
        id: Joi.string(),
        tags: tagSschema,
        elements: elementsSchema,
    }),
);

export const parseBlob = (blob: string): JSON => {
    try {
        return JSON.parse(blob);
    } catch (error: unknown) {
        throw new Error('Error parsing blob');
    }
};

export const validateCucumberReport = (obj: unknown): CucumberReport[] => {
    lambdaLogger.info('Validating report');
    const { error, value } = cucumberSchema.validate(obj, { allowUnknown: true });

    if (error) {
        lambdaLogger.debug('Error validating cucumber report', { error });
        throw error;
    }

    return value;
};
