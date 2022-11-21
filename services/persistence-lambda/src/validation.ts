import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { Report } from 'interface';
import Joi from 'joi';
import { ValidationError } from 'utils';

const ReportElementSchema = Joi.object({
    id: Joi.string().required(),
    supersede: Joi.string().allow(null),
});

const ReportResultSchema = Joi.object({
    epic: ReportElementSchema.required(),
    story: ReportElementSchema.required(),
    test: ReportElementSchema.required(),
    result: Joi.boolean().required(),
    failure: Joi.object({
        step: Joi.string().required(),
        stacktrace: Joi.string().required(),
    }).allow(null),
});

const ReportSchema = Joi.object({
    execution: Joi.object({
        timestamp: Joi.string().required(),
        environment: Joi.string().required(),
    }).required(),
    epics: Joi.array().items(ReportElementSchema).required(),
    stories: Joi.array().items(ReportElementSchema).required(),
    tests: Joi.array().items(ReportElementSchema).required(),
    results: Joi.array().items(ReportResultSchema).required(),
});

export const validateReport = (obj: unknown): Report => {
    lambdaLogger.info('Validating report', { obj });
    const { error, value } = ReportSchema.validate(obj, { allowUnknown: true });

    if (error) {
        lambdaLogger.debug('Error validating report', { error });
        throw new ValidationError('Error validating report');
    }

    return value;
};
