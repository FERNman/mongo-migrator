import { Collection, Db, MongoClient, MongoClientOptions } from 'mongodb';
import { DatabaseConfig } from './config/database-config';
import { AppliedMigration } from './migrations/applied-migration';

export class DatabaseConnection {
  public static async connect(
    url: string,
    options: MongoClientOptions,
    config: DatabaseConfig
  ): Promise<DatabaseConnection> {
    const connection = await MongoClient.connect(url, options);
    return new DatabaseConnection(connection, config);
  }

  public get db(): Db {
    return this.connection.db(this.config.name);
  }

  public get migrationsCollection(): Collection<AppliedMigration> {
    return this.db.collection<AppliedMigration>(this.config.migrationsCollection || 'migrations');
  }

  private constructor(private readonly connection: MongoClient, private readonly config: DatabaseConfig) {}

  public async close(): Promise<void> {
    await this.connection.close();
  }
}
