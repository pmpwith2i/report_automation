import 'mocha';
import { validateExecutionReport } from 'validation';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { FinalReport } from 'interface';

chai.use(chaiAsPromised);
const expect = chai.expect;

import cucumberReports from '../source/cucumberreport.json';
import { formatExecutionReport } from 'utils';

describe('utils tests', () => {
    describe('when formatCucumberFeatures is invoked', () => {
        describe('when a valid array of Feature is passed', () => {
            let res: FinalReport;

            before(() => {
                const reportExecution = validateExecutionReport(cucumberReports);
                res = formatExecutionReport(reportExecution);
            });

            it('should return an object', () => {
                expect(res).to.be.an('object');
            });

            it('should return an array of feature', () => {
                expect(res.features).to.be.an('array');
                expect(res.features[0]).to.have.property('epic');
                expect(res.features[0]).to.have.property('story');
                expect(res.features[0]).to.have.property('tests');
                expect(res.features[0]).to.have.property('results');
            });

            it('should return a valid execution object', () => {
                expect(res.execution).to.have.property('timestamp');
                expect(res.execution).to.have.property('environment');
            });

            it('should return a valid epic object', () => {
                expect(res.features[0].epic).to.have.property('id');
            });

            it('should return a valid story object', () => {
                expect(res.features[0].story).to.have.property('id');
            });

            it('should return a valid test object', () => {
                expect(res.features[0].results[0].test).to.have.property('id');
            });

            it('should return a valid failure object', () => {
                expect(res.features[0].results.find((el) => !el.status)?.failure).to.have.all.keys('step', 'screenshot', 'stacktrace');
            });
        });
    });
});
