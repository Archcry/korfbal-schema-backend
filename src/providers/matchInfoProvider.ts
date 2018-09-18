import { inject } from 'inversify';
import TYPES from '../constants/types';
import MatchApi, { MatchApiResponseEntry } from '../services/matchApi/matchApi';
import DutySchemaApi, { DutySchemaApiResponseEntry } from '../services/dutySchemaApi/dutySchemeApi';
import { Moment } from 'moment';
import { provide } from '../ioc/iocUtils';

@provide(TYPES.MatchProvider)
export default class MatchInfoProvider {
  constructor(
    @inject(TYPES.MatchApi) private matchApi: MatchApi,
    @inject(TYPES.DutySchemaApi) private dutySchemaApi: DutySchemaApi
  ) { }

  public async getMatchesForTeam(teamId: number): Promise<Match[]> {
    const matchEntries = await this.matchApi.getMatchesForTeam(teamId);
    const dutySchemaEntries = await this.dutySchemaApi.getDutySchemaEntries();

    const matches = [];

    for (const matchEntry of matchEntries) {
      for (const dutySchemaEntry of dutySchemaEntries) {
        if (matchEntry.id === dutySchemaEntry.gameId) {
          matches.push(this.createMatch(matchEntry, dutySchemaEntry));
        }
      }
    }

    return matches;
  }

  private createMatch(matchEntry: MatchApiResponseEntry, dutySchemaEntry: DutySchemaApiResponseEntry): Match {
    return {
      id: matchEntry.id,
      homeTeam: matchEntry.homeTeam,
      awayTeam: matchEntry.awayTeam,
      dateTime: matchEntry.dateTime,
      facility: matchEntry.facility,
      dutySchema: dutySchemaEntry
    };
  }
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  dateTime: Moment;
  facility: Facility;
  dutySchema: DutySchema;
}

export interface Team {
  id: number;
  name: string;
}

export interface Facility {
  name: string;
  address: string;
  zipCode: string;
  city: string;
}

export interface DutySchema {
  wash: string[];
  drive: string[];
}
