import { Db, MongoClient } from 'mongodb';

export interface DatabaseConnection {
  readonly db: Db;
  readonly client: MongoClient;
}
