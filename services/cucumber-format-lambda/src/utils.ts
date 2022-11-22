import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { CucumberFeature, ExecutionReport, Feature, FeatureElement, FeatureResult, FinalReport, StoryReportElement, TestReportElement } from 'interface';
export class S3Error extends Error {}

const getResults = (obj: CucumberFeature): Feature => {
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
            const failedStep = element.steps.find((step) => step.result.status === 'failed');
            results.push({
                test,
                status: failedStep !== null,
                ...(failedStep && {
                    failure: {
                        step: failedStep.name,
                        stacktrace: 'TBD---TBD',
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

export const formatFeatures = (cucumberFeatures: CucumberFeature[]): Feature[] => {
    lambdaLogger.info('Formatting report');
    const finalReports: Feature[] = cucumberFeatures.map((cucumberFeature) => {
        const results = getResults(cucumberFeature);
        return results;
    });

    return finalReports;
};

export const formatExecutionReport = (obj: ExecutionReport): FinalReport => ({
    features: formatFeatures(obj.features),
    execution: {
        timestamp: new Date().toISOString(),
        environment: obj.environment,
    },
});
