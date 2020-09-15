import { Db } from 'mongodb';

export interface MigrationFile {
  up: (db: Db) => Promise<unknown>;
  down: (db: Db) => Promise<unknown>;
}
