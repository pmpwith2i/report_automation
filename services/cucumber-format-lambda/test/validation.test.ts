import 'mocha';
import { parseBlob, validateExecutionReport } from 'validation';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

import cucumberReport from '../source/cucumberreport.json';
import { ExecutionReport } from 'interface';
import Joi from 'joi';

describe('validation tests', () => {
    describe('when parseBlob is invoked', () => {
        describe('when a valid string is passed', () => {
            it('should return a JSON object', () => {
                const result = parseBlob('{"ok": true}');
                expect(result).to.be.an('object');
            });
        });

        describe('when an invalid is passed', () => {
            it('should throw an error', () => {
                const result = () => parseBlob('"ok": true}');
                expect(result).to.throw(Error);
            });
        });
    });

    describe('when validateExecutionReport is invoked', () => {
        describe('and an invalid json is passed', () => {
            let res: (obj: unknown) => ExecutionReport;

            before(() => {
                res = () => validateExecutionReport({ ok: 'ok' });
            });

            it('should throw an error', () => {
                expect(res).to.throw(Joi.ValidationError);
            });
        });

        describe('and a valid json is passed', () => {
            let res: ExecutionReport;

            before(() => {
                res = validateExecutionReport(cucumberReport);
            });

            it('should return an object', () => {
                expect(res).to.not.be.null;
            });

            it('should return the environment', () => {
                expect(res.environment).to.be.a.string;
            });

            it('should return timestamp', () => {
                expect(res.timestamp).to.be.a.string;
                expect(Date.parse(res.timestamp)).to.not.be.NaN;
            });

            it('should return the features', () => {
                expect(res.features).to.be.an('array');
            });

            it('should return the features with the correct properties', () => {
                expect(res.features[0]).to.contains.all.keys('keyword', 'name', 'tags', 'elements', 'uri');
            });

            it('should return the elements', () => {
                expect(res.features[0].elements).to.be.an('array');
            });

            it('should return the elements with the correct properties', () => {
                expect(res.features[0].elements[0]).to.contains.all.keys('keyword', 'name', 'tags', 'steps');
            });

            it('should return the steps', () => {
                expect(res.features[0].elements[0].steps).to.be.an('array');
            });

            it('should return the steps with the correct properties', () => {
                expect(res.features[0].elements[0].steps[0]).to.contains.all.keys('keyword', 'name', 'result');
            });
        });
    });
});
