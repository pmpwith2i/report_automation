import { CucumberReport, FinalReport, FinalReportElement, FinalReportResult } from 'interface';
export class ValidationError extends Error {}

const getResults = (obj: CucumberReport) => {
    const results: FinalReportResult[] = [];
    obj.elements.forEach((element) => {
        const epic: FinalReportElement = { id: '', supersede: '' };

        const testTag = element.tags.find((tag) => tag?.name?.startsWith('@TEST'));
        const storyTag = element.tags.find((tag) => tag?.name?.startsWith('@REQ'));
        if (testTag && storyTag) {
            const test: FinalReportElement = {
                id: testTag?.name ?? '',
                supersede: '',
            };

            const story: FinalReportElement = {
                id: storyTag?.name ?? '',
                supersede: '',
            };

            const failedStep = element.steps.find((step) => step.result.status === 'failed');

            results.push({
                epic,
                story,
                test,
                result: failedStep !== null,
                ...(failedStep && {
                    failure: {
                        step: failedStep.name,
                        stacktrace: '',
                    },
                }),
            });
        }
    });

    return results;
};

export const formatCucumberReport = (reports: CucumberReport[]): FinalReport[] => {
    const finalReports: FinalReport[] = reports.map((cucumberReport) => {
        const results = getResults(cucumberReport);
        const epics = results.map((result) => result.epic);
        const stories = results.map((result) => result.story);
        const tests = results.map((result) => result.test);

        return {
            execution: {
                timestamp: '',
                environment: '',
            },
            epics,
            stories,
            tests,
            results,
        };
    });

    return finalReports;
};
