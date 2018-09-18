import 'reflect-metadata';
import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import { assert, expect } from 'chai';
import FsDutySchemaApi from '../../../../src/services/dutySchemaApi/fsDutySchemaApi';

describe('FsDutySchemaApi', () => {
  const sandbox = sinon.createSandbox();

  const dutySchemaLocation = path.resolve('/path/to/dutySchema.json');

  let readFileStub: sinon.SinonStub;

  let subjectUnderTest: FsDutySchemaApi;

  beforeEach(() => {
    readFileStub = sandbox.stub(fs, 'readFile').callsArgWith(2, null, `[
      {
        "gameId": 2154,
        "drive": ["Carl", "Jane"],
        "wash": ["Carl"]
      }, {
        "gameId": 2154,
        "drive": ["Sarah", "Wren"],
        "wash": ["Sarah"]
      }
    ]`);

    subjectUnderTest = new FsDutySchemaApi(dutySchemaLocation);
  });

  afterEach(() => sandbox.restore());

  it('should call fs.readFile with the location of the schema.json defined in the environment and UTF-8', async () => {
    await subjectUnderTest.getDutySchemaEntries();

    const assertionError = `Expected fs.readFile to be called with: "${dutySchemaLocation}"`;
    assert(readFileStub.calledWith(dutySchemaLocation, 'UTF-8'), assertionError);
  });

  it('should reject with an error when fs encounters a problem', async () => {
    const error = `ENOENT, no such file or directory '/test/path/with/no/file.json'`;
    readFileStub.callsArgWith(2, error);

    try {
      await subjectUnderTest.getDutySchemaEntries();

      assert(false, 'getDutySchemaEntries should\'ve thrown an error');
    } catch (err) {
      expect(err.message).to.equal(`Error: could not fetch duty schema entries: ${error}`);
    }
  });

  it('should convert the response to an array with DutySchemaResponseEntry objects', async () => {
    const dutySchemaResponseEntries = await subjectUnderTest.getDutySchemaEntries();

    expect(dutySchemaResponseEntries).to.deep.equal([
      {
        gameId: 2154,
        drive: ['Carl', 'Jane'],
        wash: ['Carl']
      }, {
        gameId: 2154,
        drive: ['Sarah', 'Wren'],
        wash: ['Sarah']
      }
    ]);
  });
});
