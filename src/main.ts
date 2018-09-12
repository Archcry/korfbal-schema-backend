import * as express from 'express';
import IocContext from './ioc/ioc';
import * as path from 'path';
import TYPES from './constants/types';

class Main {
  private app: express.Application;
  private environment: Environment;
  private iocContext: IocContext;

  public constructor(environment: Environment) {
    this.app = express();
    this.environment = environment;
    this.iocContext = new IocContext(path.resolve(__dirname, '..'));
  }

  public async initialize() {
    // Dynamically load annotated classes inside the loadPaths context
    this.iocContext.componentScan(this.environment.loadPaths);
    const container = this.iocContext.getContainer();

    // Bind dependencies to the container
    container.bind<Environment>(TYPES.Environment).toConstantValue(this.environment);
    container.bind(TYPES.Console).toConstantValue(global.console);
  }

  public onListening() {
    // To be implemented
  }

  public get App(): express.Application {
    return this.app;
  }
}

export = Main;
