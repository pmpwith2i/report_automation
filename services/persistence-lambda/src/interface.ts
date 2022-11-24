export interface ReportExecution {
    execution: Execution;
    features: Feature[];
}

export interface FeatureElement {
    id: string;
    supersede: string;
}

export interface Execution {
    timestamp: string;
    environment: string;
}

export interface FeatureResult {
    test: TestReportElement;
    status: boolean;
    failure?: {
        step: string;
        stacktrace: string;
        screenshot: string;
    };
}

export type TestReportElement = FeatureElement;
export type StoryReportElement = FeatureElement;

export interface Feature {
    epic: FeatureElement;
    story: StoryReportElement;
    tests: TestReportElement[];
    results: FeatureResult[];
}
