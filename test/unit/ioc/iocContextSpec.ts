import * as sinon from 'sinon';
import * as fs from 'fs';
import * as path from 'path';
import IocContext from '../../../src/ioc/ioc';
import { assert, expect } from 'chai';
import { ContainerModule } from 'inversify';

const loader: any = {
  loader: () => { /* fake implementation */ }
};

const container: any = {
  load: () => { /* fake implementation */ }
};

const reflect: any = {
  getMetadata: () => { /* fake implementation */ }
};

describe('IocContext', () => {
  const sandbox = sinon.createSandbox();
  const projectRoot = '/path/to/project';
  const contextPath = 'services';
  const awesomeModulePath = path.join(projectRoot, contextPath, 'awesomeModule');
  const modulePath = path.join(projectRoot, contextPath, 'module');

  let readdirSyncStub: sinon.SinonStub;
  let loaderStub: sinon.SinonStub;
  let getMetadataStub: sinon.SinonStub;
  let bindStub: sinon.SinonStub;
  let constraintStub: sinon.SinonStub;

  let subjectUnderTest: IocContext;

  beforeEach(() => {
    readdirSyncStub = createReaddirSyncStub();
    constraintStub = createConstraintStub();
    getMetadataStub = createMetadataStub(constraintStub);

    loaderStub = sandbox.stub(loader, 'loader');
    bindStub = sandbox.stub();

    createContainerLoadStub(bindStub);
    createStatSyncStub();

    subjectUnderTest = new IocContext(projectRoot, loader.loader, container, reflect);
  });

  afterEach(() => sandbox.restore());

  it('should return the container when getContainer is called', () => {
    expect(subjectUnderTest.getContainer()).equals(container);
  });

  it('should call readdirSync with "services" as parameter on first call', () => {
    subjectUnderTest.componentScan([contextPath]);

    assert(readdirSyncStub.calledWith(path.join(projectRoot, contextPath)));
  });

  it('should call readdirSync thrice when componentScan is invoked', () => {
    subjectUnderTest.componentScan([contextPath]);

    assert(readdirSyncStub.calledThrice);
  });

  it('should load the files with a js extension when componentScan is called', () => {
    subjectUnderTest.componentScan([contextPath]);

    assert(loaderStub.calledWith(path.join(awesomeModulePath, 'awesomeFile.js')));
    assert(loaderStub.calledWith(path.join(awesomeModulePath, 'anotherAwesomeFile.js')));
    assert(loaderStub.calledWith(path.join(modulePath, 'file.js')));

    assert(loaderStub.neverCalledWith(path.join(awesomeModulePath, 'notAJsFile.txt')));
    assert(loaderStub.neverCalledWith(path.join(modulePath, 'anotherFile.ts')));
  });

  it('should call "getMetadata" method on "Reflect" with the correct annotation identifier', () => {
    subjectUnderTest.componentScan([contextPath]);

    assert(getMetadataStub.calledWith('inversify-binding-decorators:provide'));
  });

  it('should call the constraint method on the returned reflect metadata', () => {
    subjectUnderTest.componentScan([contextPath]);

    assert(constraintStub.calledWith(bindStub, 'test'));
  });

  it('should be able to handle scenario\'s where getMetadata returns undefined', () => {
    getMetadataStub.returns(undefined);

    subjectUnderTest.componentScan([contextPath]);

    assert(bindStub.notCalled);
  });

  const createReaddirSyncStub = () => {
    const stub = sandbox.stub(fs, 'readdirSync');

    stub.withArgs(path.join(projectRoot, contextPath)).returns(['awesomeModule', 'module']);
    stub.withArgs(awesomeModulePath).returns(['awesomeFile.js', 'anotherAwesomeFile.js', 'notAJsFile.txt']);
    stub.withArgs(modulePath).returns(['file.js', 'anotherFile.ts']);

    return stub;
  };

  const createStatSyncStub = () => {
    const stub = sandbox.stub(fs, 'statSync');

    stub.withArgs(path.join(projectRoot, contextPath, 'module')).returns({ isDirectory: () => true });
    stub.withArgs(path.join(projectRoot, contextPath, 'awesomeModule')).returns({ isDirectory: () => true });
    stub.returns({ isDirectory: () => false });

    return stub;
  };

  const createContainerLoadStub = (bind: any) => {
    const DONT_CARE: any = {};

    const stub = sandbox.stub(container, 'load');

    stub.callsFake((containerModule: ContainerModule) => {
      containerModule.registry(bind, DONT_CARE, DONT_CARE, DONT_CARE);
    });

    return stub;
  };

  const createMetadataStub = (constraint: any) => {
    const stub = sandbox.stub(reflect, 'getMetadata');

    stub.returns([{ constraint, implementationType: 'test' }]);

    return stub;
  };

  const createConstraintStub = () => {
    const stub = sandbox.stub();

    stub.callsArg(0);

    return stub;
  };
});
