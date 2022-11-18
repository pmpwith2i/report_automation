import { StackProps } from 'aws-cdk-lib';

export interface QaReportStackProps extends StackProps {
    vpcId: string;
    cucumberPrefix: string;
    dbHost: string;
    dbPort: string;
    dbUsername: string;
    dbPassword: string;
    dbName: string;
}
