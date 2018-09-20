import MatchApi, { MatchApiResponseEntry, Team, Facility } from './matchApi';
import fetch from 'node-fetch';
import * as moment from 'moment-timezone';

export default class KnkvApi implements MatchApi {
  public constructor(
    private apiKey: string,
    private apiUrl: string = 'https://www2.knkv.nl/kcp'
  ) { }

  public async getMatchesForTeam(teamId: number): Promise<MatchApiResponseEntry[]> {
    try {
      const responseBody = await this.fetchData(teamId);

      const filteredMatches = this.processResponse(responseBody).filter((match) => {
        return match.homeTeam.id === teamId || match.awayTeam.id === teamId;
      });

      return filteredMatches;
    } catch (err) {
      throw new Error(`Something went wrong when fetching match data: ${err}`);
    }
  }

  private async fetchData(teamId: number) {
    let requestString = this.apiUrl;

    requestString += `/${this.apiKey}`;
    requestString += `?callback=jsonp_return`;
    requestString += `&f=get_program`;
    requestString += `&full=1`;
    requestString += `&team_id=${teamId}`;

    return fetch(requestString)
      .then((response) => response.ok ? response.text() : Promise.reject('Network response was not ok.'))
      .then((responseString) => JSON.parse(responseString.replace(/^jsonp_return\(|\)\;/g, '')));
  }

  private processResponse(responseBody: any) {
    const matches: MatchApiResponseEntry[] = [];

    for (const key in responseBody) {
      if (responseBody.hasOwnProperty(key)) {
        responseBody[key].items.forEach((item: any) => {
          matches.push(this.createMatch(item));
        });
      }
    }

    return matches;
  }

  private createMatch(item: any): MatchApiResponseEntry {
    return {
      id: parseInt(item.game_id, 10),
      homeTeam: this.createTeam(item.home_team_id, item.home_team_name),
      awayTeam: this.createTeam(item.away_team_id, item.away_team_name),
      facility: this.createFacility(item.facility),
      dateTime: moment.tz(`${item.date} ${item.time}`, 'Europe/Amsterdam')
    };
  }

  private createTeam(id: string, name: string): Team {
    return { id: parseInt(id, 10), name: name.trim() };
  }

  private createFacility(facility: any): Facility {
    return {
      name: facility.facility_name.trim(),
      address: facility.facility_address.trim(),
      zipCode: facility.facility_zipcode.trim(),
      city: facility.facility_city.trim()
    };
  }
}
