import { MongoClient } from 'mongodb';
import { DatabaseConfig } from '../config/database-config';
import { ConnectionOptions } from '../types/connection-options';
import { DatabaseConnection } from './database-connection';

export async function connectToDatabase(
  options: ConnectionOptions,
  config: DatabaseConfig
): Promise<DatabaseConnection> {
  const client = await MongoClient.connect(options.url, options.config);
  const db = client.db(config.name);

  return { client, db };
}
