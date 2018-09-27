import * as express from 'express';
import IocContext from './ioc/iocContext';
import * as path from 'path';
import TYPES from './constants/types';
import DutySchemaApi from './services/dutySchemaApi/dutySchemeApi';
import FsDutySchemaApi from './services/dutySchemaApi/fsDutySchemaApi';
import KnkvApi from './services/matchApi/knkvApi';
import MatchApi from './services/matchApi/matchApi';
import Cache from './libraries/caching/cache';
import MatchController from './controllers/matchController';

class Main {
  private app: express.Application;
  private environment: Environment;
  private iocContext: IocContext;

  public constructor(environment: Environment) {
    this.app = express();

    environment.projectRoot = path.resolve(__dirname, '..');
    this.environment = environment;

    this.iocContext = new IocContext(environment.projectRoot);

    this.configureCorsMiddleware();
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

    // Initialize cache and add it to the ioc container
    container.bind<Cache>(TYPES.Cache).toConstantValue(new Cache(this.environment.cacheTtl));
  }

  public onListening() {
    const matchController = this.iocContext.getContainer().get<MatchController>(TYPES.MatchController);

    this.app.get('/matches', matchController.getMatches.bind(matchController));
  }

  private configureCorsMiddleware() {
    this.app.use((request, response, next) => {
      const origin = request.headers.origin as string;

      if (this.environment.corsAllowedOrigins.indexOf(origin) !== -1) {
        response.header('Access-Control-Allow-Origin', origin);
      }

      response.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
      response.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');

      next();
    });
  }

  public get App(): express.Application {
    return this.app;
  }
}

export = Main;
