import { Moment } from 'moment';

export interface CombinedMatchInfo extends Match, WashAndDrive {
  // Combines Match, WashAndDrive and Location (in the future)
}

export interface Match {
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

export interface WashAndDrive {
  drive: string[];
  wash: string[];
}
