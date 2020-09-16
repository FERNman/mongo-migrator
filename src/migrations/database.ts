import { DatabaseConfig } from '../config/database-config';
import { asyncFilter } from '../helpers/async-filter';
import { DatabaseConnection } from '../helpers/database-connection';
import { loadMigrations } from '../helpers/load-migrations';
import { ConnectionOptions } from '../types/connection-options';
import { MigrationStatus } from '../types/migration-status';
import { Batch } from './batch';
import { Migration } from './migration';

export class Database {
  constructor(private readonly options: ConnectionOptions, private readonly config: DatabaseConfig) {}

  public async migrate(): Promise<void> {
    const connection = await this.connect();
    const migrations = await this.getMigrations();

    const batch = await this.createPendingBatch(connection, migrations);
    if (batch) {
      await batch.migrate(connection);
    }

    await connection.close();
  }

  private async connect(): Promise<DatabaseConnection> {
    return DatabaseConnection.connect(this.options, this.config);
  }

  private getMigrations(): Promise<Migration[]> {
    return loadMigrations(this.config.files || [`${this.config.name}/*`]);
  }

  private async createPendingBatch(
    connection: DatabaseConnection,
    migrations: Migration[]
  ): Promise<Batch | undefined> {
    const pendingMigrations = await asyncFilter(migrations, async migration => {
      const status = await migration.getStatus(connection);
      return status === MigrationStatus.Pending;
    });

    if (pendingMigrations.length === 0) {
      return undefined;
    }

    return new Batch(pendingMigrations);
  }
}
