export interface GetReportFromBucket {
    bucketName: string;
    key: string;
}

export interface CucumberReport {
    keyword: string;
    name: string;
    elements: {
        id: string;
        keyword: string;
        name: string;
        tags: {
            name: string;
        }[];
        steps: {
            name: string;
            result: { status: 'passed' | 'failed' };
        }[];
    }[];
}

export interface FinalReportResult {
    epic: FinalReportElement;
    story: StoryReportElement;
    test: TestReportElement;
    result: boolean;
    failure?: {
        step: string;
        stacktrace: string;
    };
}

export interface FinalReportElement {
    id: string;
    supersede: string;
}

export type TestReportElement = FinalReportElement & { storyId: string };
export type StoryReportElement = FinalReportElement & { epicId: string };

export interface FinalReport {
    execution: {
        timestamp: string;
        environment: string;
    };
    epics: FinalReportElement[];
    stories: StoryReportElement[];
    tests: TestReportElement[];
    results: FinalReportResult[];
}
