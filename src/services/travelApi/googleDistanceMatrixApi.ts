import TravelApi, { TravelApiResponseEntry, Location } from './travelApi';
import fetch from 'node-fetch';

export default class GoogleDistanceMatrixApi implements TravelApi {
  private static API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  public constructor(
    private apiKey: string
  ) {}

  public getTravelInfo(from: Location, to: Location, arrivalTime: number): Promise<TravelApiResponseEntry> {
    const fromString = this.createStringLocation(from);
    const destinationString = this.createStringLocation(to);

    fetch(this.createRequestUrl(fromString, destinationString));
    fetch(this.createRequestUrl(fromString, destinationString));

    return Promise.resolve((from.address + to.address + arrivalTime) as any);
  }

  private createStringLocation(location: Location) {
    return `${location.address}, ${location.zipCode} ${location.city}, ${location.country}`;
  }

  private createRequestUrl(originString: string, destinationString: string) {
    return `${GoogleDistanceMatrixApi.API_URL}
      ?key=${this.apiKey}
      &origins=${originString}
      &destinations=${destinationString}`;
  }
}
