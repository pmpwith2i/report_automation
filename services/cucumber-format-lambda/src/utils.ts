import lambdaLogger from '@packages/lambda-logger/src/lambda-logger';
import { CucumberReport, FinalReport, FinalReportElement, FinalReportResult, StoryReportElement, TestReportElement } from 'interface';
export class S3Error extends Error {}

const getResults = (obj: CucumberReport): FinalReportResult[] => {
    const results: FinalReportResult[] = [];
    obj.elements.forEach((element) => {
        const epic: FinalReportElement = {
            id: 'AUT_FIRST_EPIC',
            supersede: 'Fake supersede',
        };

        const testTag = element.tags.find((tag) => tag?.name?.startsWith('@TEST'));
        const storyTag = element.tags.find((tag) => tag?.name?.startsWith('@REQ'));
        if (testTag && storyTag) {
            const story: StoryReportElement = {
                epicId: epic.id,
                id: storyTag?.name ?? '',
                supersede: 'Fake supersede',
            };

            const test: TestReportElement = {
                id: testTag?.name ?? '',
                storyId: story.id,
                supersede: 'Fake supersede',
            };

            const failedStep = element.steps.find((step) => step.result.status === 'failed');
            results.push({
                epic,
                story,
                test,
                execution: {
                    id: `${new Date().getTime()}_FAKE_ENV`,
                    environment: 'Fake environment',
                    timestamp: 'Fake timestamp',
                },
                result: failedStep !== null,
                ...(failedStep && {
                    failure: {
                        step: failedStep.name,
                        stacktrace: 'TBD---TBD',
                    },
                }),
            });
        }
    });

    return results;
};

export const formatCucumberReport = (reports: CucumberReport[]): FinalReport[] => {
    lambdaLogger.info('Formatting report');
    const finalReports: FinalReport[] = reports.map((cucumberReport) => {
        const results = getResults(cucumberReport);

        return {
            results,
        };
    });

    return finalReports;
};
