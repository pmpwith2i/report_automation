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
    story: FinalReportElement;
    test: FinalReportElement;
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

export interface FinalReport {
    execution: {
        timestamp: string;
        environment: string;
    };
    epics: FinalReportElement[];
    stories: FinalReportElement[];
    tests: FinalReportElement[];
    results: FinalReportResult[];
}
