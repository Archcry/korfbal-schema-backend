export default interface TravelApi {
  getTravelInfo(from: string, to: string, arrivalTime: number): Promise<TravelApiResponseEntry>;
}

export interface TravelApiResponseEntry {
  fromLocation: string;
  toLocation: string;
  distance: number;
  duration: number;
}
