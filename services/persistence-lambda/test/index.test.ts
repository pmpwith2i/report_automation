import 'mocha';
import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';

chai.use(chaiAsPromised);
const expect = chai.expect;

describe('handler tests', () => {
    it('should return true', () => {
        expect(true).to.be.true;
    });
});
