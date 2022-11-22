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
                expect(res.environment).to.equal('local');
            });

            it('should return timestamp', () => {
                expect(res.timestamp).to.equal('2022-11-22T15:00:00.000Z');
            });

            it('should return the features', () => {
                expect(res.features).to.be.an('array');
            });
        });
    });
});
