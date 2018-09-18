import 'reflect-metadata';
import { assert } from 'chai';
import * as sinon from 'sinon';
import MatchInfoProvider from '../../../src/providers/matchInfoProvider';
import MatchApi from '../../../src/services/matchApi/matchApi';

describe('MatchInfoProvider', () => {
  const sandbox = sinon.createSandbox();
  const teamId = 13879;

  let matchApiStub: sinon.SinonStubbedInstance<MatchApi>;

  let subjectUnderTest: MatchInfoProvider;

  beforeEach(() => {
    matchApiStub = {
      getMatchesForTeam: sandbox.stub()
    };

    subjectUnderTest = new MatchInfoProvider(matchApiStub);
  });

  afterEach(() => sandbox.restore());

  it('should fetch match information using the match api', async () => {
    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(matchApiStub.getMatchesForTeam.calledWith(teamId), `matchApi not called with teamId: "${teamId}"`);
  });

  it('should fetch dutySchema information using the dutySchemaApi');

  it('should combine all fetched data in an CombinedMatchInfo object');
});
