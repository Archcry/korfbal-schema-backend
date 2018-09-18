import { inject } from 'inversify';
import TYPES from '../constants/types';
import MatchApi from '../services/matchApi/matchApi';

export default class MatchInfoProvider {
  constructor(
    @inject(TYPES.MatchApi) private matchApi: MatchApi
  ) { }

  public async getMatchesForTeam(teamId: number) {
    this.matchApi.getMatchesForTeam(teamId);
  }
}
