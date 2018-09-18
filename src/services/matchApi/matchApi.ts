import { Moment } from 'moment';

export default interface MatchApi {
  getMatchesForTeam(teamId: number): Promise<MatchApiResponseEntry[]>;
}

export interface MatchApiResponseEntry {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  dateTime: Moment;
  facility: Facility;
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
