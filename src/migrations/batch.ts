import { DatabaseConnection } from '../database-connection';
import { loadMigrations } from './load-migrations';
import { Migration } from './migration';
import { MigrationStatus } from './migration-status';

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
