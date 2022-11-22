import 'mocha';
import { validateCucumberReport } from 'validation';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { FinalReport } from 'interface';

chai.use(chaiAsPromised);
const expect = chai.expect;

import cucumberReports from '../source/cucumberreport.json';
import { formatCucumberReport } from 'utils';

describe('utils tests', () => {
    describe('when formatCucumberReport is invoked', () => {
        describe('when a valid array of CucumberReport is passed', () => {
            let res: FinalReport[];

            before(() => {
                const report = validateCucumberReport(cucumberReports);
                res = formatCucumberReport(report);
            });

            it('should return an array', () => {
                expect(res).to.be.an('array');
            });

            it('should return an array of FinalReport', () => {
                expect(res[0]).to.be.an('object');
            });

            it('should return an array of FinalReport with the correct results property', () => {
                expect(res[0].results[0]).to.have.property('epic');
                expect(res[0].results[0]).to.have.property('story');
                expect(res[0].results[0]).to.have.property('test');
                expect(res[0].results[0]).to.have.property('result');
                expect(res[0].results[0]).to.have.property('failure');
                expect(res[0].results[0]).to.have.property('execution');
            });

            it('should returna valid execution object', () => {
                expect(res[0].results[0].execution).to.have.property('id');
                expect(res[0].results[0].execution).to.have.property('timestamp');
                expect(res[0].results[0].execution).to.have.property('environment');
            });

            it('should returna valid epic object', () => {
                expect(res[0].results[0].epic).to.have.property('id');
                expect(res[0].results[0].epic).to.have.property('supersede');
            });

            it('should returna valid story object', () => {
                expect(res[0].results[0].story).to.have.property('id');
                expect(res[0].results[0].story).to.have.property('supersede');
            });

            it('should returna valid test object', () => {
                expect(res[0].results[0].test).to.have.property('id');
                expect(res[0].results[0].test).to.have.property('supersede');
            });
        });
    });
});
