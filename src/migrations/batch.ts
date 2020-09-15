import { DatabaseConnection } from '../helpers/database-connection';
import { loadMigrations } from '../helpers/load-migrations';
import { MigrationStatus } from '../types/migration-status';
import { Migration } from './migration';

export class Batch {
  public static async fromFiles(files: string[]): Promise<Batch> {
    const migrations = await loadMigrations(files);
    return new Batch(migrations);
  }

  private constructor(private readonly migrations: Migration[]) {}

  public async up(connection: DatabaseConnection): Promise<void> {
    for (const migration of this.migrations) {
      const status = await migration.getStatus(connection);
      if (status === MigrationStatus.Pending) {
        await migration.up(connection);
      }
    }
  }
}
