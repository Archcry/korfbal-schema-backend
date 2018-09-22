import { inject } from 'inversify';
import TYPES from '../constants/types';
import MatchApi, { MatchApiResponseEntry } from '../services/matchApi/matchApi';
import DutySchemaApi, { DutySchemaApiResponseEntry } from '../services/dutySchemaApi/dutySchemeApi';
import { provide } from '../ioc/iocUtils';
import Cache from '../libraries/caching/cache';

@provide(TYPES.MatchProvider)
export default class MatchInfoProvider {
  constructor(
    @inject(TYPES.MatchApi) private matchApi: MatchApi,
    @inject(TYPES.DutySchemaApi) private dutySchemaApi: DutySchemaApi,
    @inject(TYPES.Cache) private cache: Cache
  ) { }

  public async getMatchesForTeam(teamId: number): Promise<Match[]> {
    const matches = this.cache.get<Match[]>('MatchInfoProvider.matches', () => this.fetchMatchesForTeam(teamId));

    return matches;
  }

  private async fetchMatchesForTeam(teamId: number) {
    const matchEntries = await this.matchApi.getMatchesForTeam(teamId);
    const dutySchemaEntries = await this.dutySchemaApi.getDutySchemaEntries();

    return this.combineResults(matchEntries, dutySchemaEntries);
  }

  private combineResults(matchEntries: MatchApiResponseEntry[], dutySchemaEntries: DutySchemaApiResponseEntry[]) {
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
      timestamp: matchEntry.dateTime.unix(),
      facility: matchEntry.facility,
      dutySchema: dutySchemaEntry
    };
  }
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  timestamp: number;
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
