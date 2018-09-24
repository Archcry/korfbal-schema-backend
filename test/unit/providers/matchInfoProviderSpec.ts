import 'reflect-metadata';
import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import * as moment from 'moment';
import MatchInfoProvider from '../../../src/providers/matchInfoProvider';
import MatchApi, { MatchApiResponseEntry } from '../../../src/services/matchApi/matchApi';
import DutySchemaApi, { DutySchemaApiResponseEntry } from '../../../src/services/dutySchemaApi/dutySchemeApi';
import Cache from '../../../src/libraries/caching/cache';

describe('MatchInfoProvider', () => {
  const sandbox = sinon.createSandbox();
  const teamId = 13879;

  let matchApiStub: sinon.SinonStubbedInstance<MatchApi>;
  let dutySchemaApiStub: sinon.SinonStubbedInstance<DutySchemaApi>;
  let cacheGetSpy: sinon.SinonSpy;

  let subjectUnderTest: MatchInfoProvider;

  beforeEach(() => {
    matchApiStub = {
      getMatchesForTeam: sandbox.stub()
    };

    dutySchemaApiStub = {
      getDutySchemaEntries: sandbox.stub()
    };

    matchApiStub.getMatchesForTeam.returns(Promise.resolve(matchApiFakeResponse));
    dutySchemaApiStub.getDutySchemaEntries.returns(Promise.resolve(dutySchemaApiFakeResponse));

    const cache = new Cache(3600);
    cacheGetSpy = sandbox.spy(cache, 'get');

    subjectUnderTest = new MatchInfoProvider(matchApiStub, dutySchemaApiStub, cache);
  });

  afterEach(() => sandbox.restore());

  it('should fetch match information using the match api', async () => {
    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(matchApiStub.getMatchesForTeam.calledWith(teamId), `matchApi not called with teamId: "${teamId}"`);
  });

  it('should fetch dutySchema information using the dutySchemaApi', async () => {
    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(dutySchemaApiStub.getDutySchemaEntries.called, 'dutySchemaApi.getDutySchemaEntries should\'ve been called');
  });

  it('should fetch travelinformation based on a fixed from address');

  it('should only fetch travel information for matches that are not played at home');

  it('should use the cache to retrieve matches', async () => {
    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(cacheGetSpy.calledWith('MatchInfoProvider.matches'));
  });

  it('should combine all fetched data in an CombinedMatchInfo object', async () => {
    const matches = await subjectUnderTest.getMatchesForTeam(teamId);

    expect(matches).to.deep.equal([
      {
        id: 25740,
        homeTeam: { id: 12723, name: 'Aladna/De Issel 1' },
        awayTeam: { id: 13879, name: 'Zwaluwen 4' },
        facility: { name: 'Sportpark Zuid', address: 'Bocholtsestraatweg 67 a', zipCode: '7121JB', city: 'Aalten' },
        timestamp: moment('2018-09-16 13:00').unix(),
        dutySchema:   {
          gameId: 25740,
          drive: ['Carl', 'Jane'],
          wash: ['Carl']
        }
      },
      {
        id: 22831,
        homeTeam: { id: 44345, name: 'Diderna/Visser Sloopwerken 3' },
        awayTeam: { id: 13879, name: 'Zwaluwen 4' },
        facility: { name: 'Het Nieuwland', address: 'Kolonieweg 2', zipCode: '6952GX', city: 'Dieren' },
        timestamp: moment('2018-10-21 13:00').unix(),
        dutySchema: {
          gameId: 22831,
          drive: ['Sarah', 'Wren'],
          wash: ['Sarah']
        }
      }
    ]);
  });
});

const matchApiFakeResponse: MatchApiResponseEntry[] = [
  {
    id: 25740,
    homeTeam: { id: 12723, name: 'Aladna/De Issel 1' },
    awayTeam: { id: 13879, name: 'Zwaluwen 4' },
    facility: { name: 'Sportpark Zuid', address: 'Bocholtsestraatweg 67 a', zipCode: '7121JB', city: 'Aalten' },
    dateTime: moment('2018-09-16 13:00')
  },
  {
    id: 56498,
    homeTeam: { id: 13879, name: 'Zwaluwen 4' },
    awayTeam: { id: 13582, name: 'Olympus \'58 3' },
    facility: { name: 'Sportpark Hengelder', address: 'Marconistraat 18', zipCode: '6902PC', city: 'Zevenaar' },
    dateTime: moment('2018-10-14 13:00')
  },
  {
    id: 22831,
    homeTeam: { id: 44345, name: 'Diderna/Visser Sloopwerken 3' },
    awayTeam: { id: 13879, name: 'Zwaluwen 4' },
    facility: { name: 'Het Nieuwland', address: 'Kolonieweg 2', zipCode: '6952GX', city: 'Dieren' },
    dateTime: moment('2018-10-21 13:00')
  }
];

const dutySchemaApiFakeResponse: DutySchemaApiResponseEntry[] = [
  {
    gameId: 25740,
    drive: ['Carl', 'Jane'],
    wash: ['Carl']
  }, {
    gameId: 22831,
    drive: ['Sarah', 'Wren'],
    wash: ['Sarah']
  },
  {
    gameId: 1234,
    drive: ['Theo', 'Angela'],
    wash: ['theo']
  }
];
