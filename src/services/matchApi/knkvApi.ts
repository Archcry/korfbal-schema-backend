import MatchApi from './matchApi';
import { Match } from '../../entities';

export default class KnkvApi implements MatchApi {
  public constructor(
    private apiKey: string
  ) { }

  public getMatchesForTeam(teamId: number): Promise<Match[]> {
    throw new Error('Method not implemented.');
  }
}
