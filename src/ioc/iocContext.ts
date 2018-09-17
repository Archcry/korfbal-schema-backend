import { Container, ContainerModule } from 'inversify';
import * as path from 'path';
import * as fs from 'fs';
import 'reflect-metadata';

export default class IocContext {
  private static METADATA_PROVIDE_KEY = 'inversify-binding-decorators:provide';
  private static ALLOWED_EXTENSIONS = ['.js'];

  public constructor(
    private projectRoot: string,
    /* istanbul ignore next */
    private loader: NodeRequire = require,
    /* istanbul ignore next */
    private container: Container = new Container(),
    /* istanbul ignore next */
    private reflect: any = Reflect
  ) { }

  public componentScan(contextPaths: string[]) {
    contextPaths.forEach(contextPath => this.readDir(path.join(this.projectRoot, contextPath)));

    this.container.load(this.getAnnotatedDependencies());
  }

  public getContainer() {
    return this.container;
  }

  private readDir(dir: string) {
    fs.readdirSync(dir).forEach((entity) => {
      this.processEntity(path.join(dir, entity));
    });
  }

  private processEntity(entity: string) {
    if (fs.statSync(entity).isDirectory()) {
      this.readDir(entity);
    } else {
      this.loadFile(entity);
    }
  }

  private loadFile(filePath: string) {
    if (IocContext.ALLOWED_EXTENSIONS.indexOf(path.extname(filePath)) !== -1) {
      this.loader(filePath);
    }
  }

  private getAnnotatedDependencies() {
    return new ContainerModule(bind => {
      const provideMetadata: any[] = this.reflect.getMetadata(IocContext.METADATA_PROVIDE_KEY, this.reflect) || [];
      provideMetadata.map(metadata => metadata.constraint(bind, metadata.implementationType));
    });
  }
}
