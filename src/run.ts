import { Config } from './config/config';
import { DatabaseConfig } from './config/database-config';
import { DatabaseConnection } from './helpers/database-connection';
import { Batch } from './migrations/batch';

/**
 * Applies pending migrations for all databases.
 */
export async function run(config: Config): Promise<void> {
  for (const database of config.databases) {
    await runMigrations(config, database);
  }
}

async function runMigrations(config: Config, dbConfig: DatabaseConfig): Promise<void> {
  const connection = await DatabaseConnection.connect(config.url, config.mongoClientOptions || {}, dbConfig);

  const batch = await Batch.fromFiles(dbConfig.files || [`${dbConfig.name}/*`]);
  await batch.up(connection);

  await connection.close();
}
