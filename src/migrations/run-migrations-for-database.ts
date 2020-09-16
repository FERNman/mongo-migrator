import { DatabaseConfig } from '../config/database-config';
import { connectToDatabase } from '../helpers/connect-to-database';
import { DatabaseConnection } from '../helpers/database-connection';
import { getChangelog } from '../helpers/get-changelog-collection';
import { Changelog } from '../types/changelog';
import { ConnectionOptions } from '../types/connection-options';
import { Migration } from '../types/migration';
import { getPendingMigrationsForDatabase } from './get-pending-migrations-for-database';
import { loadMigration } from './load-migration';

export async function runMigrationsForDatabase(options: ConnectionOptions, config: DatabaseConfig): Promise<void> {
  const connection = await connectToDatabase(options, config);

  const migrations = await getPendingMigrationsForDatabase(connection, config);
  if (migrations.length > 0) {
    await runMigrations(connection, migrations);
    await addChangelogEntry(getChangelog(connection, config), migrations);
  }

  await connection.client.close();
}

async function runMigrations(connection: DatabaseConnection, migrations: Migration[]): Promise<void> {
  const loadedMigrations = await Promise.all(migrations.map(m => loadMigration(m.filepath)));
  for (const migration of loadedMigrations) {
    await migration.up(connection.db);
  }
}

async function addChangelogEntry(changelog: Changelog, migrations: Migration[]): Promise<void> {
  const migrationNames = migrations.map(m => m.name);
  await changelog.insertOne({ date: new Date(), migrations: migrationNames });
}
