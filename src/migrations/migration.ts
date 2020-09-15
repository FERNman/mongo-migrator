import path from 'path';
import { DatabaseConnection } from '../database-connection';
import { MigrationFile } from './migration-file';
import { MigrationStatus } from './migration-status';

export class Migration {
  private get name(): string {
    return path.basename(this.filename).replace(/\.[^/.]+$/, '');
  }

  private get filepath(): string {
    return path.resolve(process.cwd(), this.filename);
  }

  private file!: MigrationFile;

  private constructor(private readonly filename: string) {}

  public static async fromFile(filename: string): Promise<Migration> {
    const migration = new Migration(filename);
    await migration.load();
    return migration;
  }

  private async load(): Promise<void> {
    this.file = await import(this.filepath);
  }

  public async up(connection: DatabaseConnection): Promise<void> {
    await this.file.up(connection.db);
    await connection.migrationsCollection.insertOne({ name: this.name, date: new Date() });
  }

  public async getStatus(connection: DatabaseConnection): Promise<MigrationStatus> {
    const document = await connection.migrationsCollection.findOne({ name: this.name });
    if (document) {
      return MigrationStatus.Applied;
    }

    return MigrationStatus.Pending;
  }
}
