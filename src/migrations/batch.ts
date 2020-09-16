import { DatabaseConnection } from '../helpers/database-connection';
import { Migration } from './migration';

export class Batch {
  constructor(private readonly migrations: Migration[]) {}

  public async migrate(connection: DatabaseConnection): Promise<void> {
    for (const migration of this.migrations) {
      await migration.up(connection);
    }

    await this.persistToChangelog(connection);
  }

  private async persistToChangelog(connection: DatabaseConnection): Promise<void> {
    const migrationNames = this.migrations.map(m => m.name);
    await connection.changelog.insertOne({ date: new Date(), migrations: migrationNames });
  }
}
