export default interface DutySchemaApi {
  getDutySchemaEntries(): Promise<DutySchemaApiResponseEntry[]>;
}

export interface DutySchemaApiResponseEntry {
  gameId: number;
  wash: string[];
  drive: string[];
}
