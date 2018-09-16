import { inject } from 'inversify';
import TYPES from '../constants/types';
import MatchApi from '../services/matchApi/matchApi';
import * as fs from 'fs';
import * as path from 'path';

export default class MatchInfoProvider {
  constructor(
    @inject(TYPES.MatchApi) private matchApi: MatchApi,
    @inject(TYPES.Environment) private environment: Environment
  ) { }

  public async getMatchesForTeam(teamId: number) {
    this.matchApi.getMatchesForTeam(teamId);

    try {
      await this.getDriveAndWashSchema();
    } catch (err) {
      throw new Error(`Error while trying to provide matches: ${err}`);
    }
  }

  private getDriveAndWashSchema() {
    const schemaPath = path.resolve(this.environment.projectRoot, this.environment.driveAndWashSchemaLocation);

    return new Promise((resolve, reject) => {
      fs.readFile(schemaPath, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
}
