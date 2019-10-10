export default class MatchInfoProvider {
  public getMatchesForTeam(team: Team): Match {
    return null;
  }
}

export interface Team {
  name: string;
  locations: string;
  icalToken: string;
}

export interface Match {

}
