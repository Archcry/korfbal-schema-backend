import * as express from 'express';
import IocContext from './ioc/iocContext';
import * as path from 'path';
import TYPES from './constants/types';
import DutySchemaApi from './services/dutySchemaApi/dutySchemeApi';
import FsDutySchemaApi from './services/dutySchemaApi/fsDutySchemaApi';
import MatchInfoProvider from './providers/matchInfoProvider';
import KnkvApi from './services/matchApi/knkvApi';
import MatchApi from './services/matchApi/matchApi';

class Main {
  private app: express.Application;
  private environment: Environment;
  private iocContext: IocContext;

  public constructor(environment: Environment) {
    this.app = express();

    environment.projectRoot = path.resolve(__dirname, '..');
    this.environment = environment;

    this.iocContext = new IocContext(environment.projectRoot);
  }

  public async initialize() {
    // Dynamically load annotated classes inside the loadPaths context
    this.iocContext.componentScan(this.environment.loadPaths);
    const container = this.iocContext.getContainer();

    // Bind dependencies to the container
    container.bind<Environment>(TYPES.Environment).toConstantValue(this.environment);
    container.bind(TYPES.Console).toConstantValue(global.console);

    // Initialize match api and add it to the ioc container
    container.bind<MatchApi>(TYPES.MatchApi).toConstantValue(new KnkvApi(this.environment.knkvApiKey));

    // Initialize duty schema api and add it to the ioc container
    const dutySchemaLocation = path.resolve(this.environment.projectRoot, this.environment.dutySchemaLocation);
    container.bind<DutySchemaApi>(TYPES.DutySchemaApi).toConstantValue(new FsDutySchemaApi(dutySchemaLocation));
  }

  public onListening() {
    const matchProvider = this.iocContext.getContainer().get<MatchInfoProvider>(TYPES.MatchProvider);

    this.app.get('/matches', async (request, response) => {
      if (request) {
        response.send(await matchProvider.getMatchesForTeam(this.environment.teamId));
      }
    });
  }

  public get App(): express.Application {
    return this.app;
  }
}

export = Main;
