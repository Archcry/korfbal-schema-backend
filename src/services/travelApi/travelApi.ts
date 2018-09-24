export default interface TravelApi {
  getDistance(from: Location, to: Location, arrivalTime: number): Promise<TravelApiResponseEntry>;
}

export interface Location {
  serialNumber: number;
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
