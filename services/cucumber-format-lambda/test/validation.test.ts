import 'mocha';
import { parseBlob, validateCucumberReport } from 'validation';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

import { ValidationError } from 'utils';

import cucumberReport from '../source/cucumberreport.json';
import { CucumberReport } from 'interface';

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

    describe('when validateCucumberReport is invoked', () => {
        describe('and an invalid json is passed', () => {
            let res: (obj: unknown) => CucumberReport[];

            before(() => {
                res = () => validateCucumberReport({ ok: 'ok' });
            });

            it('should throw an error', () => {
                expect(res).to.throw(ValidationError);
            });
        });

        describe('and a valid json is passed', () => {
            let res: CucumberReport[];

            before(() => {
                res = validateCucumberReport(cucumberReport);
            });

            it('should throw an error', () => {
                expect(res).to.not.be.null;
            });
        });
    });
});
