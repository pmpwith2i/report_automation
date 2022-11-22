export interface ReportResult {
    epic: ReportElement;
    story: ReportElement;
    test: ReportElement;
    result: boolean;
    execution: ReportExecution;
    failure?: {
        step: string;
        stacktrace: string;
    };
}

export interface ReportElement {
    id: string;
    supersede: string;
}

export interface ReportExecution {
    id: string;
    timestamp: string;
    environment: string;
}

export interface Report {
    results: ReportResult[];
}
