import { inject } from 'inversify';
import TYPES from '../constants/types';
import MatchApi, { MatchApiResponseEntry } from '../services/matchApi/matchApi';
import DutySchemaApi, { DutySchemaApiResponseEntry } from '../services/dutySchemaApi/dutySchemeApi';
import { provide } from '../ioc/iocUtils';
import TravelApi from '../services/travelApi/travelApi';
import * as moment from 'moment';

@provide(TYPES.MatchProvider)
export default class MatchInfoProvider {
  constructor(
    @inject(TYPES.MatchApi) private matchApi: MatchApi,
    @inject(TYPES.DutySchemaApi) private dutySchemaApi: DutySchemaApi,
    @inject(TYPES.TravelApi) private travelApi: TravelApi
  ) { }

  public async getMatchesForTeam(teamId: number): Promise<Match[]> {
    const matchEntries = await this.matchApi.getMatchesForTeam(teamId);
    const dutySchemaEntries = await this.dutySchemaApi.getDutySchemaEntries();

    return this.combineResults(matchEntries, dutySchemaEntries, teamId);
  }

  private async combineResults(
    matchEntries: MatchApiResponseEntry[],
    dutySchemaEntries: DutySchemaApiResponseEntry[],
    teamId: number
  ) {
    const matches = [];

    for (const matchEntry of matchEntries) {
      for (const dutySchemaEntry of dutySchemaEntries) {
        if (matchEntry.id === dutySchemaEntry.gameId) {
          const timeTable: TimeTable = await this.getTimeTable(teamId, matchEntry);

          matches.push(this.createMatch(matchEntry, dutySchemaEntry, timeTable));
        }
      }
    }

    return matches;
  }

  private async getTimeTable(teamId: number, matchEntry: MatchApiResponseEntry) {
    let additionalMoments;

    if (teamId !== matchEntry.homeTeam.id) {
      const extraTime = moment.duration(30, 'minutes');
      const desiredArrivalTime = matchEntry.dateTime.add(extraTime);

      const travelInfo = await this.getTravelInfo(matchEntry.facility, desiredArrivalTime.unix());

      additionalMoments = moment.duration(travelInfo.duration, 'seconds').add(extraTime);
    } else {
      additionalMoments = moment.duration(45, 'minutes');
    }

    return this.createTimeTable(matchEntry.dateTime, additionalMoments);
  }

  private createTimeTable(playTime: moment.Moment, additionalMinutes: moment.Duration) {
    return {
      play: playTime.unix(),
      present: playTime.add(moment.duration(additionalMinutes, 'minutes')).unix()
    };
  }

  private getTravelInfo(facility: Facility, arrivalTime: number) {
    return this.travelApi.getTravelInfo(
      { address: 'Lentemorgen 3', zipCode: '6903CT', city: 'Zevenaar', country: 'Netherlands' },
      { address: facility.address, zipCode: facility.zipCode, city: facility.city, country: 'Netherlands' },
      arrivalTime
    );
  }

  private createMatch(
    matchEntry: MatchApiResponseEntry,
    dutySchemaEntry: DutySchemaApiResponseEntry,
    timeTable: TimeTable
  ): Match {
    return {
      id: matchEntry.id,
      homeTeam: matchEntry.homeTeam,
      awayTeam: matchEntry.awayTeam,
      timeTable,
      facility: matchEntry.facility,
      dutySchema: dutySchemaEntry
    };
  }
}

export interface Match {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  timeTable: TimeTable;
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

export interface TimeTable {
  play: number;
  present: number;
}
