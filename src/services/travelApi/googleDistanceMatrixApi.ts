import TravelApi, { TravelApiResponseEntry, Location } from './travelApi';
import fetch from 'node-fetch';

export default class GoogleDistanceMatrixApi implements TravelApi {
  private static API_URL = 'https://maps.googleapis.com/maps/api/distancematrix/json';

  public constructor(
    private apiKey: string
  ) { }

  public async getTravelInfo(from: Location, to: Location, arrivalTime: number): Promise<TravelApiResponseEntry> {
    try {
      const fromString = this.createStringLocation(from);
      const destinationString = this.createStringLocation(to);

      const departureTime = await this.determineDepartureTime(fromString, destinationString, arrivalTime);

      const url = this.createRequestUrl(fromString, destinationString).concat(`&departure_time=${departureTime}`);
      const result = await fetch(url).then(response => response.json());

      const element = result.rows[0].elements[0];
      const duration = (element.duration_in_traffic) ? element.duration_in_traffic.value : element.duration.value;

      return {
        fromLocation: from,
        toLocation: to,
        distance: result.rows[0].elements[0].distance.value,
        duration
      };
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

  private async determineDepartureTime(fromString: string, destinationString: string, arrivalTime: number) {
    const url = this.createRequestUrl(fromString, destinationString).concat(`&arrival_time=${arrivalTime}`);
    const result = await fetch(url).then(response => response.json());

    // We expect only one result from this query therefore we take the first row and first element
    return arrivalTime - result.rows[0].elements[0].duration.value;
  }
}
