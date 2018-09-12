import { Match } from '../../entities';

export default interface MatchApi {
  getMatchesForTeam(teamId: number): Promise<Match[]>;
}
