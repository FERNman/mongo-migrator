import { Changelog, ChangelogEntry, DatabaseConfig } from '..';
import { connectToDatabase } from '../helpers/connect-to-database';
import { DatabaseConnection } from '../helpers/database-connection';
import { getChangelog } from '../helpers/get-changelog-collection';
import { ConnectionOptions } from '../types/connection-options';
import { Migration } from '../types/migration';
import { getMigrationsByChangelogEntry } from './get-migrations-for-changelog-entry';
import { loadMigration } from './load-migration';

export async function rollbackMigrationsForDatabase(
  connectionOptions: ConnectionOptions,
  databaseConfig: DatabaseConfig
): Promise<void> {
  const connection = await connectToDatabase(connectionOptions, databaseConfig);
  const changelog = getChangelog(connection, databaseConfig);

  const latestChangelogEntry = await getLatestChangelogEntry(changelog);
  if (!latestChangelogEntry) {
    return;
  }

  const migrations = await getMigrationsByChangelogEntry(latestChangelogEntry, databaseConfig);
  await rollbackMigrations(connection, migrations);
  await removeChangelogEntry(changelog, latestChangelogEntry);

  await connection.client.close();
}

async function getLatestChangelogEntry(changelog: Changelog): Promise<ChangelogEntry | null> {
  return changelog.findOne({}, { sort: { date: -1 } });
}

async function rollbackMigrations(connection: DatabaseConnection, migrations: Migration[]): Promise<void> {
  const loadedMigrations = await Promise.all(migrations.map(m => loadMigration(m.filepath)));
  for (const migration of loadedMigrations) {
    await migration.down(connection.db);
  }
}

async function removeChangelogEntry(changelog: Changelog, entry: ChangelogEntry): Promise<void> {
  await changelog.findOneAndDelete({ _id: entry._id });
}
