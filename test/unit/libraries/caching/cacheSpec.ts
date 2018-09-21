import Cache from '../../../../src/libraries/caching/cache';
import * as sinon from 'sinon';
import * as NodeCache from 'node-cache';
import { expect, assert } from 'chai';

describe('Cache', () => {
  const sandbox = sinon.createSandbox();
  const cacheKey = 'test';
  const ttl = 3600;

  let nodeCacheSpies: { get: sinon.SinonSpy, set: sinon.SinonSpy };

  let subjectUnderTest: Cache;

  beforeEach(() => {
    const nodeCache = new NodeCache();

    nodeCacheSpies = {
      get: sandbox.spy(nodeCache, 'get'),
      set: sandbox.spy(nodeCache, 'set')
    };

    subjectUnderTest = new Cache(ttl, nodeCache);
  });

  afterEach(() => sandbox.restore());

  it('should cache an entry produced by the storeMethod when no entry is present', async () => {
    const result = await subjectUnderTest.get(cacheKey, () => 'test');

    expect(result).to.equal('test');
  });

  it('should be able to handle async store methods', async () => {
    const result = await subjectUnderTest.get(cacheKey, () => Promise.resolve('async test'));

    expect(result).to.equal('async test');
  });

  it('should only call the store method once on sunseqent call', async () => {
    const storeMethodSpy = sinon.spy(() => 'test');

    await subjectUnderTest.get(cacheKey, storeMethodSpy);
    const result = await subjectUnderTest.get(cacheKey, storeMethodSpy);

    assert(storeMethodSpy.calledOnce, 'storeMethod should be called exactly once');
    expect(result).to.equal('test');
  });

  it('should only call cache set once on a subsequent call', async () => {
    await subjectUnderTest.get(cacheKey, () => 'test');
    await subjectUnderTest.get(cacheKey, () => 'test');

    assert(nodeCacheSpies.set.calledOnce, 'cache set method should be called exactly once');
  });

  it('should call the cache set method with the correct TTL', async () => {
    await subjectUnderTest.get(cacheKey, () => 'test');

    assert(nodeCacheSpies.set.calledWith(sinon.match.string, sinon.match.string, ttl));
  });
});
