import { Config } from './config/config';
import { rollbackMigrationsForDatabase } from './migrations/rollback-migrations-for-database';
import { ConnectionOptions } from './types/connection-options';

/**
 * Reverts the most recently applied migrations for all databases.
 */
export async function rollback(config: Config): Promise<void> {
  const connectionOptions: ConnectionOptions = { url: config.url, config: config.mongoClientOptions };

  for (const dbOptions of config.databases) {
    await rollbackMigrationsForDatabase(connectionOptions, dbOptions);
  }
}
