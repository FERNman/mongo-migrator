import { ChangelogEntry, DatabaseConfig } from '..';
import { Migration } from '../types/migration';
import { findMigrations } from './find-migrations';

export async function getMigrationsByChangelogEntry(
  entry: ChangelogEntry,
  config: DatabaseConfig
): Promise<Migration[]> {
  const migrations = await findMigrations(config.files || [`${config.name}/*`]);
  return entry.migrations.map(name => {
    const migration = migrations.find(m => m.name === name);
    if (!migration) {
      throw new Error(`The migration ${name} does not exist anymore and can't be rolled back!`);
    }

    return migration;
  });
}
