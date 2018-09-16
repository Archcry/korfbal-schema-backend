import { Moment } from 'moment';

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
