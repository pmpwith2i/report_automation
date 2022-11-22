import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { Report } from 'interface';
import Joi from 'joi';

const ReportElementSchema = Joi.object({
    id: Joi.string().required(),
    supersede: Joi.string().allow(null),
});

const ReportExecutionSchema = Joi.object({
    id: Joi.string().required(),
    timestamp: Joi.string().required(),
    environment: Joi.string().required(),
});

const ReportResultSchema = Joi.object({
    epic: ReportElementSchema.required(),
    story: ReportElementSchema.required(),
    test: ReportElementSchema.required(),
    result: Joi.boolean().required(),
    execution: ReportExecutionSchema,
    failure: Joi.object({
        step: Joi.string().required(),
        stacktrace: Joi.string(),
    }).allow(null),
});

const ReportSchema = Joi.array().items({
    results: Joi.array().items(ReportResultSchema).required(),
});

export const validateReport = (obj: unknown): Report[] => {
    lambdaLogger.info('Validating report', { obj });
    const { error, value } = ReportSchema.validate(obj, { allowUnknown: true });

    if (error) {
        throw error;
    }

    return value;
};
