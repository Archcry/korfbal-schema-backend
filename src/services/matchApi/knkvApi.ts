import MatchApi from './matchApi';
import { Match } from '../../entities';
import fetch from 'node-fetch';

export default class KnkvApi implements MatchApi {
  private static API_URL = 'https://www2.knkv.nl/kcp';
  private apiKey: string;

  public constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  public async getMatchesForTeam(teamId: number): Promise<Match[]> {
    await this.fetchData(teamId);

    return Promise.resolve([]);
  }

  private async fetchData(teamId: number) {
    const response = await fetch(this.createRequestString(teamId));

    return response;
  }

  private createRequestString(teamId: number) {
    let requestString = KnkvApi.API_URL;

    requestString += `/${this.apiKey}`;
    requestString += `?callback=jsonp_return`;
    requestString += `&team_id=${teamId}`;
    requestString += `full=1`;
    requestString += `f=get_program`;

    return requestString;
  }
}
