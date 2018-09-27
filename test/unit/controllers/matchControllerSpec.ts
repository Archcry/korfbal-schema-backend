import 'reflect-metadata';
import { assert } from 'chai';
import * as sinon from 'sinon';
import Cache from '../../../src/libraries/caching/cache';
import MatchController from '../../../src/controllers/matchController';
import MatchInfoProvider from '../../../src/providers/matchInfoProvider';

const response: any = {
  send: () => { /* dummy */ }
};

describe('MatchController', () => {
  const sandbox = sinon.createSandbox();
  const environment: Environment = { teamId: 1234 };

  let cacheStub: sinon.SinonStubbedInstance<Cache>;
  let matchInfoProviderStub: sinon.SinonStubbedInstance<MatchInfoProvider>;
  let responseSendSpy: sinon.SinonSpy;

  let subjectUnderTest: MatchController;

  beforeEach(() => {
    cacheStub = sandbox.createStubInstance(Cache);
    matchInfoProviderStub = sandbox.createStubInstance(MatchInfoProvider);

    responseSendSpy = sandbox.spy(response, 'send');

    subjectUnderTest = new MatchController(cacheStub as any, matchInfoProviderStub as any, environment);
  });

  afterEach(() => sandbox.restore());

  it('should call the cache to retrieve matches', async () => {
    await subjectUnderTest.getMatches({} as any, response);

    assert(cacheStub.get.calledWith('MatchProvider.matches', sinon.match.func), 'cache should be called');
  });

  it('should define a method to call when the cache does not have the entry', async () => {
    cacheStub.get.callsArg(1);

    await subjectUnderTest.getMatches({} as any, response);

    const assertionError = 'matchProvider should\'ve been called with teamId';
    assert(matchInfoProviderStub.getMatchesForTeam.calledOnceWith(environment.teamId), assertionError);
  });

  it('should send the response with the matches', async () => {
    const fakeMatches = [{ name: 'testMatch', id: 1234 }, { name: 'testMatch2', id: 5678 }];
    cacheStub.get.returns(Promise.resolve(fakeMatches));

    await subjectUnderTest.getMatches({} as any, response);

    assert(responseSendSpy.calledOnceWith(fakeMatches), 'response.send should\'ve been called with matches');
  });
});
