import TravelApi, { TravelApiResponseEntry, Location } from './travelApi';

export default class GoogleDistanceMatrixApi implements TravelApi {
  public getDistance(from: Location, to: Location, arrivalTime: number): Promise<TravelApiResponseEntry> {
    throw new Error('Method not implemented.' + from + to + arrivalTime);
  }
}
