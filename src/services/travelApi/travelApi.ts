export default interface TravelApi {
  getTravelInfo(from: Location, to: Location, arrivalTime: number): Promise<TravelApiResponseEntry>;
}

export interface Location {
  address: string;
  zipCode: string;
  city: string;
  country: string;
}

export interface TravelApiResponseEntry {
  fromLocation: Location;
  toLocation: Location;
  distace: number;
  duration: number;
}
