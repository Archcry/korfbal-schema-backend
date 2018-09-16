import 'reflect-metadata';
import { assert, expect } from 'chai';
import * as sinon from 'sinon';
import * as path from 'path';
import MatchInfoProvider from '../../../src/providers/matchInfoProvider';
import MatchApi from '../../../src/services/matchApi/matchApi';
import * as fs from 'fs';

const fakeEnvironment: Environment = {
  projectRoot: '/path/to/project',
  driveAndWashSchemaLocation: './resources/schema.json'
};

describe('MatchInfoProvider', () => {
  const sandbox = sinon.createSandbox();
  const teamId = 13879;

  const fsStub: sinon.SinonStubbedInstance<any> = {};
  let matchApiStub: sinon.SinonStubbedInstance<MatchApi>;

  let subjectUnderTest: MatchInfoProvider;

  beforeEach(() => {
    matchApiStub = {
      getMatchesForTeam: sandbox.stub()
    };

    fsStub.readFile = sandbox.stub(fs, 'readFile').callsArgWith(1, null, 'some string');

    subjectUnderTest = new MatchInfoProvider(matchApiStub, fakeEnvironment);
  });

  afterEach(() => sandbox.restore());

  it('should call readfile with the path to the schema.json location defined in the environment', async () => {
    const expectedPath = path.resolve(fakeEnvironment.projectRoot, fakeEnvironment.driveAndWashSchemaLocation);

    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(fsStub.readFile.calledWith(expectedPath), `readdir should\'ve been called with ${expectedPath}`);
  });

  it('should fetch match information using the match api', async () => {
    await subjectUnderTest.getMatchesForTeam(teamId);

    assert(matchApiStub.getMatchesForTeam.calledWith(teamId), `matchApi not called with teamId: "${teamId}"`);
  });

  it('should throw an error when the requested file could not be resolved', async () => {
    const expectedPath = path.resolve(fakeEnvironment.projectRoot, fakeEnvironment.driveAndWashSchemaLocation);
    const fsReadFileError = `ENOENT: no such file or directory, open '${expectedPath}'`;
    fsStub.readFile.callsArgWith(1, fsReadFileError);

    try {
      await subjectUnderTest.getMatchesForTeam(teamId);

      assert(false, 'subjectUnderTest.getMatchesForTeam should throw an ENOENT error');
    } catch (err) {
      expect(err.message).to.equal(`Error while trying to provide matches: ${fsReadFileError}`);
    }
  });

  it('should combine the fetched data in an CombinedMatchInfo object');
});
