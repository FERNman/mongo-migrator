import { Collection, Db, MongoClient } from 'mongodb';
import { DatabaseConfig } from '../config/database-config';
import { ChangelogEntry } from '../types/applied-migration';
import { ConnectionOptions } from '../types/connection-options';

export class DatabaseConnection {
  public static async connect(options: ConnectionOptions, config: DatabaseConfig): Promise<DatabaseConnection> {
    const connection = await MongoClient.connect(options.url, options.config);
    return new DatabaseConnection(connection, config);
  }

  public get db(): Db {
    return this.connection.db(this.config.name);
  }

  public get changelog(): Collection<ChangelogEntry> {
    return this.db.collection<ChangelogEntry>(this.config.changelog || 'changelog');
  }

  private constructor(private readonly connection: MongoClient, private readonly config: DatabaseConfig) {}

  public async close(): Promise<void> {
    await this.connection.close();
  }
}
