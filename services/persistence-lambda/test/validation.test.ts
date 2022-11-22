import 'mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { validateReport } from 'validation';
import { Report } from 'interface';
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
                let res: Report[];

                before(() => {
                    const obj = [
                        {
                            results: [
                                {
                                    epic: {
                                        id: 'AUT_111',
                                        supersede: 'Fake Supersede',
                                    },
                                    story: {
                                        id: 'AUT_STORY_111',
                                        supersede: 'Fake supersede',
                                    },
                                    test: {
                                        id: 'AUT_TEST_111',
                                        supersede: 'Fake supersede',
                                    },
                                    result: true,
                                    execution: {
                                        id: '12345678890_DEV',
                                        timestamp: '1234567890',
                                        environment: 'Fake dev',
                                    },
                                },
                                {
                                    epic: {
                                        id: 'AUT_111',
                                        supersede: 'Fake Supersede',
                                    },
                                    story: {
                                        id: 'AUT_STORY_111',
                                        supersede: 'Fake supersede',
                                    },
                                    test: {
                                        id: 'AUT_TEST_111',
                                        supersede: 'Fake supersede',
                                    },
                                    result: false,
                                    execution: {
                                        id: '12345678890_DEV',
                                        timestamp: '1234567890',
                                        environment: 'Fake dev',
                                    },
                                    failures: {
                                        step: '1',
                                        stacktrace: 'fail',
                                    },
                                },
                            ],
                        },
                    ];
                    res = validateReport(obj);
                });

                it('should return an array of reports', () => {
                    expect(res).to.be.an('array');
                });

                it('should return a valid array of reports', () => {
                    expect(res[0]).to.have.property('results');
                });

                it('should return a valid results object', () => {
                    expect(res[0].results[0]).to.have.property('epic');
                    expect(res[0].results[0]).to.have.property('story');
                    expect(res[0].results[0]).to.have.property('test');
                    expect(res[0].results[0]).to.have.property('execution');
                });

                it('should return a valid execution object', () => {
                    expect(res[0].results[0].execution).to.have.property('id');
                    expect(res[0].results[0].execution).to.have.property('timestamp');
                    expect(res[0].results[0].execution).to.have.property('environment');
                });

                it('should return a valid epic object', () => {
                    expect(res[0].results[0].epic).to.have.property('id');
                    expect(res[0].results[0].epic).to.have.property('supersede');
                });

                it('should return a valid story object', () => {
                    expect(res[0].results[0].story).to.have.property('id');
                    expect(res[0].results[0].story).to.have.property('supersede');
                });

                it('should return a valid test object', () => {
                    expect(res[0].results[0].test).to.have.property('id');
                    expect(res[0].results[0].test).to.have.property('supersede');
                });

                it('should return failures object only for failed tests', () => {
                    expect(res[0].results[0]).to.not.have.property('failures');
                    expect(res[0].results[1]).to.have.property('failures');
                });
            });
        });
    });
});
