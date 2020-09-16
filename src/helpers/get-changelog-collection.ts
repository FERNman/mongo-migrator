import { DatabaseConfig } from '../config/database-config';
import { Changelog, ChangelogEntry } from '../types/changelog';
import { DatabaseConnection } from './database-connection';

export function getChangelog(connection: DatabaseConnection, config: DatabaseConfig): Changelog {
  return connection.db.collection<ChangelogEntry>(config.changelog || 'changelog');
}
