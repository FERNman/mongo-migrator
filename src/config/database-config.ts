export interface DatabaseConfig {
  /**
   * The name of the database.
   */
  name: string;

  /**
   * A list of files containig the migrations. Supports globs to be able to use directories.
   * If not provided, searches for a directory with the same name as the database.
   */
  files?: string[];

  /**
   * The name of the collection where we keep track of already applied migrations.
   * Defaults to `changelog`.
   */
  changelog?: string;
}
