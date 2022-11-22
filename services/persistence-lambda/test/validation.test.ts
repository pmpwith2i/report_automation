import 'mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { validateReport } from 'validation';
import { ReportExecution } from 'interface';
import Joi from 'joi';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('validation tests', () => {
    describe('when validateReport is invoked', () => {
        describe('and a json is provided', () => {
            describe('but is invalid', () => {
                let res: () => unknown;

                before(() => {
                    const obj = {
                        results: {
                            epic: {
                                id: 'Fake ID',
                                wrongField: 'a wrong field',
                            },
                        },
                    };
                    res = () => validateReport(obj);
                });

                it('should be rejected with ValidationError', () => {
                    expect(res).to.throw(Joi.ValidationError);
                });
            });

            describe('and is a valid json', () => {
                let res: ReportExecution;

                before(() => {
                    const obj = {
                        execution: {
                            id: 'Fake ID',
                            timestamp: '2021-01-01T00:00:00.000Z',
                            environment: 'Fake environment',
                        },
                        features: [
                            {
                                epic: {
                                    id: 'Fake ID',
                                    supersede: 'Fake supersede',
                                },
                                story: {
                                    id: 'Fake ID',
                                    supersede: 'Fake supersede',
                                },
                                tests: [
                                    {
                                        id: 'Fake ID',
                                        supersede: 'Fake supersede',
                                    },
                                ],
                                results: [
                                    {
                                        test: {
                                            id: 'Fake ID',
                                        },
                                        status: true,
                                        duration: 0,
                                        error: {
                                            message: 'Fake message',
                                            stack: 'Fake stack',
                                        },
                                    },
                                ],
                            },
                        ],
                    };
                    res = validateReport(obj);
                });

                it('should return a report', () => {
                    expect(res).to.be.an('object');
                });

                it('should return a valid array of results', () => {
                    expect(res).to.have.property('features');
                });

                it('should return a valid results object', () => {
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
                    expect(res.features[0].epic).to.have.property('supersede');
                });

                it('should return a valid story object', () => {
                    expect(res.features[0].story).to.have.property('id');
                    expect(res.features[0].story).to.have.property('supersede');
                });

                it('should return a valid test object', () => {
                    expect(res.features[0].tests[0]).to.have.property('id');
                    expect(res.features[0].tests[0]).to.have.property('supersede');
                });
            });
        });
    });
});
