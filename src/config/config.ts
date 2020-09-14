import { MongoClientOptions } from 'mongodb';
import { DatabaseConfig } from './database-config';

export interface Config {
  url: string;
  mongoClientOptions?: MongoClientOptions;
  databases: DatabaseConfig[];
}
