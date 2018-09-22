import * as NodeCache from 'node-cache';

export default class Cache {
  public constructor(
    private ttl: number,
    private nodeCache: NodeCache = new NodeCache()
  ) { }

  public async get<T>(key: string, storeMethod: () => Promise<T> | T): Promise<T> {
    let value = this.nodeCache.get(key) as T;

    if (!value) {
      value = await storeMethod();

      this.nodeCache.set(key, value, this.ttl);
    }

    return value;
  }
}
