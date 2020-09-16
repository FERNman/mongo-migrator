import { MongoClientOptions } from 'mongodb';

export interface ConnectionOptions {
  url: string;
  config?: MongoClientOptions;
}
