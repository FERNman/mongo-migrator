import { MongoClient } from 'mongodb';
import { Config } from './config/config';
import { DatabaseConfig } from './config/database-config';
import { getAuthFromConfig } from './config/get-auth-from-config';
import { getUrlFromConfig } from './config/get-url-from-config';
import { getMigrationFiles } from './migrations/get-migration-files';
import { loadMigration } from './migrations/load-migration';

/**
 * Applies pending migrations for all databases.
 */
export async function run(config: Config): Promise<void> {
  const client = new MongoClient(getUrlFromConfig(config), { auth: getAuthFromConfig(config) });
  await client.connect();

  for (const database of config.databases) {
    await runMigrations(client, database);
  }
}

async function runMigrations(client: MongoClient, config: DatabaseConfig): Promise<void> {
  const db = client.db(config.name);
  const files = config.files || [`${config.name}/*`];

  const migrations = await getMigrationFiles(files);
  for (const filename of migrations) {
    const migration = await loadMigration(filename);
    await migration.up(db);
  }
}
