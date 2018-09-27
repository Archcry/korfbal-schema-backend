import { Request, Response } from 'express';
import Cache from '../libraries/caching/cache';
import MatchInfoProvider from '../providers/matchInfoProvider';
import { inject } from 'inversify';
import TYPES from '../constants/types';

export default class MatchController {
  public constructor(
    @inject(TYPES.Cache) private cache: Cache,
    @inject(TYPES.MatchProvider) private matchInfoProvider: MatchInfoProvider,
    @inject(TYPES.Environment) private environment: Environment
  ) { }

  public async getMatches(_request: Request, response: Response): Promise<void> {
    const result = await this.cache.get('MatchProvider.matches', async () => {
      return await this.matchInfoProvider.getMatchesForTeam(this.environment.teamId);
    });

    response.send(result);
  }
}
