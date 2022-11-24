import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { KEYWORD_AFTER, MIMETYPE_IMAGE_PNG, STATUS_FAILED } from './constants';
import { CucumberFeature, ExecutionReport, Feature, FeatureElement, FeatureResult, FinalReport, StoryReportElement, TestReportElement } from 'interface';
import { putScreenshotIntoBucket } from 'strategy';
export class S3Error extends Error {}

const getResults = (obj: CucumberFeature, executionEnvironment: string, executionTimestamp: string): Feature => {
    const results: FeatureResult[] = [];

    const uriFolders = obj.uri.split('/');
    const epicFolder = uriFolders[uriFolders.length - 2];

    const epic: FeatureElement = {
        id: epicFolder?.split('_')[0],
    };

    const storyTag = obj.tags.find((tag) => tag?.name?.startsWith('@REQ'));

    const story: StoryReportElement = {
        id: storyTag?.name?.split('@REQ_')?.[1] ?? '',
    };

    const tests: TestReportElement[] = [];

    obj.elements.forEach((element) => {
        const testTag = element.tags.find((tag) => tag?.name?.startsWith('@TEST'));

        const test: TestReportElement = {
            id: testTag?.name?.split('@TEST_')?.[1] ?? '',
        };

        tests.push(test);

        if (testTag && storyTag) {
            let screenshot;
            let status = true;
            let stacktrace = '';
            let failedStepName;
            for (const step of element.steps) {
                if (step.result.status === STATUS_FAILED) {
                    status = false;
                    failedStepName = step.name;
                    stacktrace = step.result.error_message;
                }

                if (!status && step.keyword == KEYWORD_AFTER) {
                    const imageScreenshot = step.embeddings.find((embedding) => embedding.mime_type === MIMETYPE_IMAGE_PNG);
                    if (imageScreenshot) {
                        screenshot = `${executionEnvironment}_ ${executionTimestamp}_${test.id}`;
                        putScreenshotIntoBucket({
                            key: `screenshots/${screenshot}.png`,
                            body: Buffer.from(imageScreenshot.data, 'base64'),
                            contentType: imageScreenshot.mime_type,
                            contentEnconding: 'base64',
                        });
                        break;
                    }
                }
            }

            results.push({
                test,
                status,
                ...(failedStepName && {
                    failure: {
                        step: failedStepName,
                        stacktrace,
                        screenshot,
                    },
                }),
            });
        }
    });

    return {
        epic,
        story,
        tests,
        results,
    };
};

export const formatFeatures = (executionReport: ExecutionReport): Feature[] => {
    lambdaLogger.info('Formatting report features');
    const finalReports: Feature[] = executionReport.features.map((cucumberFeature) => {
        const results = getResults(cucumberFeature, executionReport.environment, executionReport.timestamp);
        return results;
    });

    return finalReports;
};

export const formatExecutionReport = (executionReport: ExecutionReport): FinalReport => ({
    features: formatFeatures(executionReport),
    execution: {
        timestamp: executionReport.timestamp,
        environment: executionReport.environment,
    },
});
