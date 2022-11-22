export interface GetReportFromBucket {
    bucketName: string;
    key: string;
}

export interface ExecutionReport {
    timestamp: string;
    environment: string;
    features: CucumberFeature[];
}

export interface CucumberFeature {
    keyword: string;
    name: string;
    tags: {
        name: string;
    }[];
    uri: string;
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

export interface FeatureElement {
    id: string;
    supersede?: string;
}

export interface Execution {
    timestamp: string;
    environment: string;
}

export type TestReportElement = FeatureElement;
export type StoryReportElement = FeatureElement;

export interface FeatureResult {
    test: TestReportElement;
    status: boolean;
    failure?: {
        step: string;
        stacktrace: string;
    };
}

export interface Feature {
    epic: FeatureElement;
    story: StoryReportElement;
    tests: TestReportElement[];
    results: FeatureResult[];
}

export interface FinalReport {
    features: Feature[];
    execution: Execution;
}
