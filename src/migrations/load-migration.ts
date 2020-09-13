import { Migration } from './migration';

export function loadMigration(filename: string): Promise<Migration> {
  return import(filename);
}
