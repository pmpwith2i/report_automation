import 'mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { getReportFromBucket } from 'strategy';
import { S3Error } from 'utils';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('strategy tests', () => {
    describe('when getReportFromBucket is invoked', () => {
        describe('but the s3 getObject fails', () => {
            // TODO: Implement here
            let res: unknown;

            before(() => {
                res = getReportFromBucket({ bucketName: 'testBucket', key: 'testKey' });
            });
            it('should be rejected with S3 Error', () => {
                expect(res).to.be.rejectedWith(S3Error);
            });
        });

        describe('and s3 getObject succeed', () => {
            // TODO: implement sinon stub here
            // it('should return a valid Body object', () => {});
        });
    });
});
