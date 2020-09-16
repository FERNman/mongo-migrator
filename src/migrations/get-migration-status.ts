import { Changelog } from '../types/changelog';
import { Migration } from '../types/migration';
import { MigrationStatus } from '../types/migration-status';

export async function getMigrationStatus(migration: Migration, changelog: Changelog): Promise<MigrationStatus> {
  const batch = await changelog.findOne({ migrations: migration.name });
  if (batch) {
    return MigrationStatus.Applied;
  }

  return MigrationStatus.Pending;
}
