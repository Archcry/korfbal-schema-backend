import 'reflect-metadata';
import KnkvApi from '../../../../src/services/matchApi/knkvApi';
import * as sinon from 'sinon';
import * as fetch from '../../../../src/libraries/fetch/fetch';
import { assert, expect } from 'chai';
import knkvSampleResponse from './knkvSampleResponse';
import customSinonMatchers from '../../helpers/customSinonMatchers';
import * as moment from 'moment-timezone';

describe('Knkv Api', () => {
  const sandbox = sinon.createSandbox();
  const apiKey = 'someApiKey';
  const teamId = 13879;

  let fetchStub: sinon.SinonStub;

  let subjectUnderTest: KnkvApi;

  beforeEach(() => {
    subjectUnderTest = new KnkvApi(apiKey);

    fetchStub = sandbox.stub(fetch, 'default').returns(Promise.resolve({
      text: () => Promise.resolve(knkvSampleResponse),
      ok: true
    }));
  });

  afterEach(() => sandbox.restore());

  describe('fetch', () => {
    it('should send a request to the knkv api endpoint with the correct url', async () => {
      const knkvApiEndpoint = 'https://www2.knkv.nl/kcp';

      await subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithKnkvEndpoint = fetchStub.calledWith(customSinonMatchers.string.contains(knkvApiEndpoint));
      assert(calledWithKnkvEndpoint, 'request string should contain the knkv api endpoint');
    });

    it('should send a request to the knkv api endpoint specifying the correct callback format', async () => {
      await subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithApiKey = fetchStub.calledWith(customSinonMatchers.string.contains('callback=jsonp_return'));
      assert(calledWithApiKey, 'request string should specify the correct callback format');
    });

    it('should send a request to the knkv api specifying the method to call', async () => {
      await subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithApiKey = fetchStub.calledWith(customSinonMatchers.string.contains('f=get_program'));
      assert(calledWithApiKey, 'request string should specify the method to call');
    });

    it('should send a request to the knkv api endpoint with the given api key', async () => {
      await subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithApiKey = fetchStub.calledWith(customSinonMatchers.string.contains(apiKey));
      assert(calledWithApiKey, 'request string should contain api key');
    });

    it('should send a request to the knkv api endpoint with the given teamId as argument', async () => {
      await subjectUnderTest.getMatchesForTeam(teamId);

      const calledWithTeamId = fetchStub.calledWith(customSinonMatchers.string.contains(`team_id=${teamId}`));
      assert(calledWithTeamId, 'request string should contain teamId');
    });

    it('should send a request to the knkv api endpoint and query for the full program', async () => {
      await subjectUnderTest.getMatchesForTeam(teamId);

      const queriedForFullProgram = fetchStub.calledWith(customSinonMatchers.string.contains('full=1'));
      assert(queriedForFullProgram, 'request string should contain a query for the full program');
    });
  });

  it('should retrieve matches filter them on team id and convert them to a certain format', async () => {
    const matches = await subjectUnderTest.getMatchesForTeam(teamId);

    expect(matches).to.deep.equal([
      {
        id: 25740,
        homeTeam: { id: 12723, name: 'Aladna/De Issel 1' },
        awayTeam: { id: 13879, name: 'Zwaluwen 4' },
        facility: { name: 'Sportpark Zuid', address: 'Bocholtsestraatweg 67 a', zipCode: '7121JB', city: 'Aalten' },
        dateTime: moment.tz('2018-09-16 13:00', 'Europe/Amsterdam')
      },
      {
        id: 22831,
        homeTeam: { id: 13879, name: 'Zwaluwen 4' },
        awayTeam: { id: 13582, name: 'Olympus \'58 3' },
        facility: { name: 'Sportpark Hengelder', address: 'Marconistraat 18', zipCode: '6902PC', city: 'Zevenaar' },
        dateTime: moment.tz('2018-10-14 13:00', 'Europe/Amsterdam')
      }
    ]);
  });

  it('should throw an error when something went wrong when fetching matches', async () => {
    const expectedError = new Error('Something went wrong when fetching match data: Network response was not ok.');
    fetchStub.returns(Promise.resolve({
      text: () => Promise.resolve(knkvSampleResponse),
      ok: false
    }));

    try {
      await subjectUnderTest.getMatchesForTeam(teamId);

      assert(false, 'subjectUnderTest.getMatchesForTeam(teamId) should throw an error');
    } catch (err) {
      expect(err.message).to.deep.equal(expectedError.message);
    }
  });

  it('should throw an error when something went wrong when fetching matches', async () => {
    const expectedError = new Error('Something went wrong when fetching match data: test reject.');
    fetchStub.returns(Promise.reject('test reject.'));

    try {
      await subjectUnderTest.getMatchesForTeam(teamId);

      assert(false, 'subjectUnderTest.getMatchesForTeam(teamId) should throw an error');
    } catch (err) {
      expect(err.message).to.deep.equal(expectedError.message);
    }
  });
});
