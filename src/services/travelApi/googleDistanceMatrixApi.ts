import TravelApi, { TravelApiResponseEntry, Location } from './travelApi';
import fetch from 'node-fetch';
import * as moment from 'moment-timezone';

export default class GoogleDistanceMatrixApi implements TravelApi {
  private static API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  public constructor(
    private apiKey: string
  ) { }

  public async getTravelInfo(from: Location, to: Location, arrivalTime: number): Promise<TravelApiResponseEntry> {
    try {
      const resourceUrl = this.createRequestUrl(this.createStringLocation(from), this.createStringLocation(to));

      const departureTime = await this.determineDepartureTime(resourceUrl, arrivalTime);
      const result = await this.fetchTravelInfo(resourceUrl, departureTime);

      return this.createTravelApiResponseEntry(from, to, result.distance, result.duration);
    } catch (err) {
      throw new Error(`Could not fetch travel information: ${err}`);
    }
  }

  private createStringLocation(location: Location) {
    return `${location.address}, ${location.zipCode} ${location.city}, ${location.country}`;
  }

  private createRequestUrl(originString: string, destinationString: string) {
    let url = GoogleDistanceMatrixApi.API_URL;

    url += `?key=${this.apiKey}`;
    url += `&origins=${originString}`;
    url += `&destinations=${destinationString}`;

    return url;
  }

  private async determineDepartureTime(resourceUrl: string, arrivalTime: number) {
    const element = await this.fetchDistanceMatrix(resourceUrl.concat(`&arrival_time=${arrivalTime}`));

    const currentTime = moment.tz('Europe/Amsterdam').unix();
    const departureTime = arrivalTime - element.duration.value;

    return (departureTime > currentTime) ? departureTime : currentTime;
  }

  private async fetchTravelInfo(resourceUrl: string, departureTime: number) {
    const element = await this.fetchDistanceMatrix(resourceUrl.concat(`&departure_time=${departureTime}`));

    return {
      duration: (element.duration_in_traffic) ? element.duration_in_traffic.value : element.duration.value,
      distance: element.distance.value
    };
  }

  private async fetchDistanceMatrix(resource: string) {
    return await fetch(resource)
      .then(response => response.json())
      .then(responseObj => responseObj.rows[0].elements[0]);
  }

  private createTravelApiResponseEntry(from: Location, to: Location, distance: number, duration: number) {
    return {
      fromLocation: from,
      toLocation: to,
      distance,
      duration
    };
  }
}
