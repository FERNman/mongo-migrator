import { Config } from './config/config';
import { DatabaseConfig } from './config/database-config';
import { Database } from './migrations/database';

/**
 * Applies pending migrations for all databases.
 */
export async function run(config: Config): Promise<void> {
  for (const database of config.databases) {
    await runMigrations(config, database);
  }
}

async function runMigrations(config: Config, dbConfig: DatabaseConfig): Promise<void> {
  const database = new Database({ url: config.url, config: config.mongoClientOptions }, dbConfig);
  await database.migrate();
}
