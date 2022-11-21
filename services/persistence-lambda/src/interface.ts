export interface ReportResult {
    epic: ReportElement;
    story: ReportElement;
    test: ReportElement;
    result: boolean;
    failure?: {
        step: string;
        stacktrace: string;
    };
}

export interface ReportElement {
    id: string;
    supersede: string;
}

export interface Report {
    execution: {
        timestamp: string;
        environment: string;
    };
    epics: ReportElement[];
    stories: ReportElement[];
    tests: ReportElement[];
    results: ReportResult[];
}
