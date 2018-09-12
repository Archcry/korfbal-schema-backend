import 'reflect-metadata';
import KnkvApi from '../../../src/services/matchApi/knkvApi';
import * as sinon from 'sinon';
import * as fetch from 'node-fetch';
import { assert } from 'chai';
import knkvSampleResponse from './knkvSampleResponse';

describe('Knkv Api', () => {
  const apiKey = 'someApiKey';
  const sandbox = sinon.createSandbox();

  let fetchStub: sinon.SinonStub;

  let subjectUnderTest: KnkvApi;

  beforeEach(() => {
    subjectUnderTest = new KnkvApi(apiKey);

    fetchStub = sandbox.stub(fetch, 'default').returns(Promise.resolve(`jsonp_return(${ knkvSampleResponse });`));
  });

  afterEach(() => sandbox.restore());

  it('should send a request to an endpoint with the given api key');

  it('should retrieve matches filter them on team id and convert them to a certain format');

  it('should throw an error when something went wrong when fetching matches');
});
