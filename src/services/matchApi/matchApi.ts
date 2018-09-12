import { Match } from '../../entities';

export default interface MatchApi {
  getMatchesForTeam(): Promise<Match[]>;
}
