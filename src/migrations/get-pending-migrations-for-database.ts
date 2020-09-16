import { DatabaseConfig } from '../config/database-config';
import { asyncFilter } from '../helpers/async-filter';
import { DatabaseConnection } from '../helpers/database-connection';
import { getChangelog } from '../helpers/get-changelog-collection';
import { Migration } from '../types/migration';
import { MigrationStatus } from '../types/migration-status';
import { findMigrations } from './find-migrations';
import { getMigrationStatus } from './get-migration-status';

export async function getPendingMigrationsForDatabase(
  connection: DatabaseConnection,
  config: DatabaseConfig
): Promise<Migration[]> {
  const migrations = await findMigrations(config.files || [`${config.name}/*`]);

  const changelog = getChangelog(connection, config);
  return asyncFilter(migrations, async migration => {
    const status = await getMigrationStatus(migration, changelog);
    return status === MigrationStatus.Pending;
  });
}
