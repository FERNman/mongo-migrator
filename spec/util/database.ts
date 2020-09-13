import { Db, MongoClient } from 'mongodb';
import { MongoMemoryServer } from 'mongodb-memory-server';

export class TestDatabase {
  private client: MongoClient;
  private _uri: string;
  private readonly instance: MongoMemoryServer;

  public get db(): Db {
    return this.client.db(this.name);
  }

  public get uri(): string {
    return this._uri;
  }

  constructor(private readonly name: string) {
    this.instance = new MongoMemoryServer({ instance: { dbName: name, storageEngine: 'ephemeralForTest' } });
  }

  public async start(): Promise<void> {
    await this.instance.start();

    this._uri = await this.instance.getUri();

    this.client = new MongoClient(this._uri);
    await this.client.connect();
  }

  public async stop(): Promise<void> {
    await this.client.close();
    await this.instance.stop();
  }

  public async reset(): Promise<void> {
    await this.db.dropDatabase();
  }
}
