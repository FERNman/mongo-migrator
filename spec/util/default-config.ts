import { Config, DatabaseConfig } from '../../src';
import { TestDatabase } from './test-database';

const DEFAULT_DATABASE = [{ name: 'Test', files: ['./spec/migrations/**/*'] }];

export function getDefaultConfig(database: TestDatabase, overrides: DatabaseConfig[] = DEFAULT_DATABASE): Config {
  return {
    url: database.uri,
    mongoClientOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    databases: overrides
  };
}
