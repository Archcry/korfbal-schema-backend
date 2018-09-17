import DutySchemaApi, { DutySchemaApiResponseEntry } from './dutySchemeApi';
import * as fs from 'fs';

export default class FsDutySchemaApi implements DutySchemaApi {
  public constructor(
    private dutySchemaLocation: string
  ) { }

  public async getDutySchemaEntries(): Promise<DutySchemaApiResponseEntry[]> {
    try {
      return await this.getSchemaFromFileSystem();
    } catch (err) {
      throw new Error(`Error: could not fetch duty schema entries: ${err}`);
    }
  }

  private getSchemaFromFileSystem(): Promise<DutySchemaApiResponseEntry[]> {
    return new Promise((resolve, reject) => {
      fs.readFile(this.dutySchemaLocation, 'UTF-8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(JSON.parse(data));
        }
      });
    });
  }
}
