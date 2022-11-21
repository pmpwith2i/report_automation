import { CucumberReport, FinalReport, FinalReportElement, FinalReportResult, StoryReportElement, TestReportElement } from 'interface';
export class ValidationError extends Error {}

const getResults = (obj: CucumberReport) => {
    const results: FinalReportResult[] = [];
    obj.elements.forEach((element) => {
        const epic: FinalReportElement = { id: 'AUT_FIRST_EPIC', supersede: '' };

        const testTag = element.tags.find((tag) => tag?.name?.startsWith('@TEST'));
        const storyTag = element.tags.find((tag) => tag?.name?.startsWith('@REQ'));
        if (testTag && storyTag) {
            const story: StoryReportElement = {
                epicId: epic.id,
                id: storyTag?.name ?? '',
                supersede: '',
            };

            const test: TestReportElement = {
                id: testTag?.name ?? '',
                storyId: story.id,
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
