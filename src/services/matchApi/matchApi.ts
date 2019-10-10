import { Moment } from 'moment';

export default interface MatchApi {
  getMatchesForToken(token: string): Promise<MatchApiResponseEntry[]>;
}

export interface MatchApiResponseEntry {
  id: number;
  name: string;
  dateTime: Moment;
  location: string;
}
