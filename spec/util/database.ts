import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class TestDatabase {
  private connection: MongoClient | undefined;
  private _uri: string | undefined;
  private readonly instance: MongoMemoryServer;

  public get db(): Db {
    if (!this.connection) {
      throw new Error('The database client is undefined. Did you forget to call `TestDatabase.start()`?');
    }

    return this.connection.db(this.name);
  }

  public get uri(): string {
    if (!this._uri) {
      throw new Error('The database URI is undefined. Did you forget to call `TestDatabase.start()`?');
    }

    return this._uri;
  }

  constructor(private readonly name: string) {
    this.instance = new MongoMemoryServer({ instance: { dbName: name, storageEngine: 'ephemeralForTest' } });
  }

  public async start(): Promise<void> {
    await this.instance.start();

    this._uri = await this.instance.getUri();

    this.connection = await MongoClient.connect(this._uri, { useUnifiedTopology: true, useNewUrlParser: true });
  }

  public async stop(): Promise<void> {
    if (this.connection) {
      await this.connection.close();
    }

    await this.instance.stop();
  }

  public async reset(): Promise<void> {
    await this.db.dropDatabase();
  }
}
