import { fluentProvide, provide } from 'inversify-binding-decorators';
import { interfaces, inject } from 'inversify';

const provideSingleton = (identifier: interfaces.ServiceIdentifier<any>) => {
  return fluentProvide(identifier).inSingletonScope().done();
};

export { provideSingleton, fluentProvide, inject, provide };
