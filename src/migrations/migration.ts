import { Db } from 'mongodb';

export interface Migration {
  up: (db: Db) => Promise<unknown>;
  down: (db: Db) => Promise<unknown>;
}
