import { Db, FilterQuery, MongoClient } from 'mongodb';

export class DatabaseHelper {
  public get db(): Db {
    if (!this.connection) {
      throw new Error('The database client is undefined. Did you forget to call `TestDatabase.start()`?');
    }

    return this.connection.db(this.name);
  }

  private connection!: MongoClient;

  constructor(public readonly name: string) {}

  public async connect(uri: string): Promise<void> {
    this.connection = await MongoClient.connect(uri, { useUnifiedTopology: true, useNewUrlParser: true });
  }

  public async disconnect(): Promise<void> {
    await this.connection.close();
  }

  public async reset(): Promise<void> {
    await this.db.dropDatabase();
  }

  public async insertData(data: { [collection: string]: unknown[] }): Promise<void> {
    const collections = Object.keys(data);
    for (const collection of collections) {
      await this.db.collection(collection).insertMany(data[collection]);
    }
  }

  public async getDocument<T = unknown>(collectionName: string, where: FilterQuery<T>): Promise<T | null> {
    return this.db.collection<T>(collectionName).findOne(where);
  }
}
