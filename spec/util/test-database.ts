import { MongoMemoryServer } from 'mongodb-memory-server';

export class TestDatabase {
  private _uri: string | undefined;
  private readonly instance: MongoMemoryServer;

  public get uri(): string {
    if (!this._uri) {
      throw new Error('The database URI is undefined. Did you forget to call `TestDatabase.start()`?');
    }

    return this._uri;
  }

  constructor() {
    this.instance = new MongoMemoryServer({ instance: { storageEngine: 'ephemeralForTest' } });
  }

  public async start(): Promise<void> {
    await this.instance.start();
    this._uri = await this.instance.getUri();
  }

  public async stop(): Promise<void> {
    await this.instance.stop();
  }
}
