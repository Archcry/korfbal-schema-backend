import 'reflect-metadata';
import { expect, assert } from 'chai';
import * as sinon from 'sinon';
import * as moment from 'moment';
import MatchInfoProvider from '../../../src/providers/matchInfoProvider';
import MatchApi, { MatchApiResponseEntry } from '../../../src/services/matchApi/matchApi';
import DutySchemaApi, { DutySchemaApiResponseEntry } from '../../../src/services/dutySchemaApi/dutySchemeApi';
import TravelApi from '../../../src/services/travelApi/travelApi';

const HOME_GAME_ADDITIONAL_TIME = moment.duration(45, 'minutes');
const AWAY_GAME_ADDITIONAL_TIME = moment.duration(35, 'minutes');

describe('MatchInfoProvider', () => {
  const sandbox = sinon.createSandbox();
  const teamId = 13879;
  const driveTime = 3600;

  let matchApiStub: sinon.SinonStubbedInstance<MatchApi>;
  let dutySchemaApiStub: sinon.SinonStubbedInstance<DutySchemaApi>;
  let travelApiStub: sinon.SinonStubbedInstance<TravelApi>;

  let subjectUnderTest: MatchInfoProvider;

  beforeEach(() => {
    matchApiStub = {
      getMatchesForTeam: sandbox.stub()
    };

    dutySchemaApiStub = {
      getDutySchemaEntries: sandbox.stub()
    };

    travelApiStub = {
      getTravelInfo: sandbox.stub()
    };

    matchApiStub.getMatchesForTeam.returns(Promise.resolve(matchApiFakeResponse));
    dutySchemaApiStub.getDutySchemaEntries.returns(Promise.resolve(dutySchemaApiFakeResponse));
    travelApiStub.getTravelInfo.returns(Promise.resolve({ distance: 1000, duration: driveTime }));

    subjectUnderTest = new MatchInfoProvider(matchApiStub, dutySchemaApiStub, travelApiStub);
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

  it('should fetch travelinformation based on a fixed from location and a dynamic to location', async () => {
    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(travelApiStub.getTravelInfo.calledWith(
      { address: 'Lentemorgen 3', zipCode: '6903CT', city: 'Zevenaar', country: 'Netherlands' },
      { address: 'Bocholtsestraatweg 67 a', zipCode: '7121JB', city: 'Aalten', country: 'Netherlands' },
      moment('2018-09-16 13:00').subtract(AWAY_GAME_ADDITIONAL_TIME).unix()
    ), 'travelApi.getTravelInfo should be called with a fixed home location and a dynamic away location');
  });

  it('should only fetch travel information for matches that are not played at home', async () => {
    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(travelApiStub.getTravelInfo.neverCalledWith(
      { address: 'Lentemorgen 3', zipCode: '6903CT', city: 'Zevenaar', country: 'Netherlands' },
      { address: 'Marconistraat 18', zipCode: '6902PC', city: 'Zevenaar', country: 'Netherlands' },
      moment('2018-10-14 13:00').subtract(AWAY_GAME_ADDITIONAL_TIME).unix()
    ), 'travelApi.getTravelInfo should not be called with a home match');
  });

  it('should combine all fetched data in an CombinedMatchInfo object', async () => {
    const matches = await subjectUnderTest.getMatchesForTeam(teamId);

    expect(matches).to.deep.equal([
      {
        id: 25740,
        homeTeam: { id: 12723, name: 'Aladna/De Issel 1' },
        awayTeam: { id: 13879, name: 'Zwaluwen 4' },
        facility: { name: 'Sportpark Zuid', address: 'Bocholtsestraatweg 67 a', zipCode: '7121JB', city: 'Aalten' },
        timeTable: {
          play: moment('2018-09-16 13:00').unix(),
          present: moment('2018-09-16 13:00').subtract(AWAY_GAME_ADDITIONAL_TIME).subtract(driveTime, 'seconds').unix()
        },
        dutySchema:   {
          gameId: 25740,
          drive: ['Carl', 'Jane'],
          wash: ['Carl']
        }
      },
      {
        id: 56498,
        homeTeam: { id: 13879, name: 'Zwaluwen 4' },
        awayTeam: { id: 13582, name: 'Olympus \'58 3' },
        facility: { name: 'Sportpark Hengelder', address: 'Marconistraat 18', zipCode: '6902PC', city: 'Zevenaar' },
        timeTable: {
          play: moment('2018-10-14 13:00').unix(),
          present: moment('2018-10-14 13:00').subtract(HOME_GAME_ADDITIONAL_TIME).unix()
        },
        dutySchema: {
          gameId: 56498,
          drive: [],
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
    gameId: 56498,
    drive: [],
    wash: ['Sarah']
  },
  {
    gameId: 1234,
    drive: ['Theo', 'Angela'],
    wash: ['theo']
  }
];
