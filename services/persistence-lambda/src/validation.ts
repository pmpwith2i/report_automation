import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { ReportExecution } from 'interface';
import Joi from 'joi';

const ReportElementSchema = Joi.object({
    id: Joi.string().required(),
    supersede: Joi.string().allow(null),
});

const ReportExecutionSchema = Joi.object({
    timestamp: Joi.string().required(),
    environment: Joi.string().required(),
});

const FeatureResultsSchema = Joi.object({
    test: ReportElementSchema.required(),
    status: Joi.boolean().required(),
    failure: Joi.object({
        step: Joi.string().required(),
        stacktrace: Joi.string().required(),
    }).allow(null),
});

const FeatureSchema = Joi.object({
    epic: ReportElementSchema.required(),
    story: ReportElementSchema.required(),
    results: Joi.array().items(FeatureResultsSchema).required(),
});

const ReportSchema = Joi.object({
    execution: ReportExecutionSchema.required(),
    features: Joi.array().items(FeatureSchema).required(),
});

export const validateReport = (obj: unknown): ReportExecution => {
    lambdaLogger.info('Validating report', { obj });
    const { error, value } = ReportSchema.validate(obj, { allowUnknown: true });

    if (error) {
        throw error;
    }

    return value;
};
