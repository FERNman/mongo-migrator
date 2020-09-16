import { MigrationFile } from '../types/migration-file';

export function loadMigration(path: string): Promise<MigrationFile> {
  return import(path);
}
