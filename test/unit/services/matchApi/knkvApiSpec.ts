import 'reflect-metadata';
import KnkvApi from '../../../../src/services/matchApi/knkvApi';
import * as sinon from 'sinon';
import * as fetch from 'node-fetch';
import { assert } from 'chai';
import knkvSampleResponse from './knkvSampleResponse';
import customSinonMatchers from '../../helpers/customSinonMatchers';

describe('Knkv Api', () => {
  const sandbox = sinon.createSandbox();
  const apiKey = 'someApiKey';
  const teamId = 1234;

  let fetchStub: sinon.SinonStub;

  let subjectUnderTest: KnkvApi;

  beforeEach(() => {
    subjectUnderTest = new KnkvApi(apiKey);

    fetchStub = sandbox.stub(fetch, 'default').returns(Promise.resolve(`jsonp_return(${knkvSampleResponse});`));
  });

  afterEach(() => sandbox.restore());

  describe('fetch', () => {
    it('should send a request to the knkv api endpoint with the correct url', () => {
      const knkvApiEndpoint = 'https://www2.knkv.nl/kcp';

      subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithKnkvEndpoint = fetchStub.calledWith(customSinonMatchers.string.contains(knkvApiEndpoint));
      assert(calledWithKnkvEndpoint, 'request string should contain the knkv api endpoint');
    });

    it('should send a request to the knkv api endpoint specifying the correct callback format', () => {
      subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithApiKey = fetchStub.calledWith(customSinonMatchers.string.contains('callback=jsonp_return'));
      assert(calledWithApiKey, 'request string should specify the correct callback format');
    });

    it('should send a request to the knkv api specifying the method to call', () => {
      subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithApiKey = fetchStub.calledWith(customSinonMatchers.string.contains('f=get_program'));
      assert(calledWithApiKey, 'request string should specify the method to call');
    });

    it('should send a request to the knkv api endpoint with the given api key', () => {
      subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithApiKey = fetchStub.calledWith(customSinonMatchers.string.contains(apiKey));
      assert(calledWithApiKey, 'request string should contain api key');
    });

    it('should send a request to the knkv api endpoint with the given teamId as argument', () => {
      subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithTeamId = fetchStub.calledWith(customSinonMatchers.string.contains(`team_id=${teamId}`));
      assert(calledWithTeamId, 'request string should contain teamId');
    });

    it('should send a request to the knkv api endpoint and query for the full program', () => {
      subjectUnderTest.getMatchesForTeam(teamId);

      const queriedForFullProgram = fetchStub.calledWith(customSinonMatchers.string.contains('full=1'));
      assert(queriedForFullProgram, 'request string should contain a query for the full program');
    });
  });

  it('should retrieve matches filter them on team id and convert them to a certain format');

  it('should throw an error when something went wrong when fetching matches');
});
