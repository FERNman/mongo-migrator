import { Config } from './config/config';
import { runMigrationsForDatabase } from './migrations/run-migrations-for-database';

/**
 * Applies pending migrations for all databases.
 */
export async function migrate(config: Config): Promise<void> {
  const connectionOptions = { url: config.url, config: config.mongoClientOptions };

  for (const dbOptions of config.databases) {
    await runMigrationsForDatabase(connectionOptions, dbOptions);
  }
}
