# mongo-migrator

![Check branch](https://github.com/FERNman/mongo-migrator/workflows/Check%20branch/badge.svg)

A database migration tool for MongoDB running in Node.js implementing the concept of the the [evolutionary database](https://martinfowler.com/articles/evodb.html).
Supports Javascript and Typescript.

> Inspired by [Flyway](https://flywaydb.org/)

# Usage

## Installation

```sh
$ npm install --save-dev mongo-migrator
```

After the installation, use `npx` to invoke the CLI:

```sh
$ npx mongo-migrator
```

## Initialize a new project

Make sure you installed [Node.js](https://nodejs.org/en/) 10 or higher.

In the directory where you want to store the migrations, initialize mongo-migator like so:

```sh
$ npx mongo-migrator init
```

This will create a `migrations.json` file in the current directory, preconfigured with some placeholder settings.

## Migrate

To run all pending migrations, simply execute the `migrate` command:

```sh
$ npx mongo-migrator migrate
```

This command will search for migrations in all directories mentioned in the config file and run all migrations that have not yet been applied to the database.

If this is the first time running `mongo-migrator` for the current database, a `changelog` collection will be created where already applied migrations are stored.

Optionally, you can provide a migration using the `target` option. `mongo-migrator` will then apply migrations until the specified migration is found (inclusive, meaning the provided migration will also be applied).

## Rollback

If something breaks during a migration, it is sometimes necessary to undo the changes. This can be done by executing the `rollback` command:

```sh
$ npx mongo-migrator rollback
```

This will undo all migrations applied during the last run of `migrate`. Keep in mind that this will fail if the migrations no longer exist on the file system.

Optionally, you can provide a migration using the `target` option. `mongo-migrator` will then roll back migrations until the specified migration is found (exclusive, meaning the provided migration will not be rolled back).

## Status

To print the current status of all migrations in the workspace, use the `status` command:

```sh
$ npx mongo-migrator status
```

This will print details and status information about all migrations. At a glance you will see which migrations are pending, which migrations have alread been applied and when they were executed.

# Configuration

## The config file

Most of the configuration of `migrate-mongo` works through the config file. The accepted config is of the following structure:

```ts
interface Config {
  // Used for connecting to the database.
  uri: string;

  // The name of the database you want to connect to. Can be included in the `uri`, in which case it's optional.
  databaseName?: string;

  // The same options as you would pass to the `MongoClient`.
  clientOptions?: MongoClientOptions;

  // An array of globs. All migrations must be located in the provided directories.
  files: string[] = [`${database.name}/*`];

  // The name of the collection where `mongo-migrator` keeps track of applied migrations.
  changelogCollectionName?: string;

  // Whether to use transactions. If set to `auto`, `mongo-migrator` will try to use transactions if the database supports it.
  // If using `force`, `mongo-migrator` will always try to use transactions and fail if they are not supported.
  transactions: 'auto' | 'off' | 'force' = 'auto';
}
```

`mongo-migrator` by default looks for a config file in the current directory named `migrations.config.js`. A custom config path can be provided through the CLI.

The default generated config file looks like this:

```js
module.exports = {
  uri: 'mongodb://localhost:27017'
};
```

## CLI arguments

All CLI arguments are optional and, if provided, override the corresponding values in the config file.

- `--uri`: The URI of the MongoDB server to connect to.
- `--username` (`-u`): The username of the MongoDB server. Can also be included in the URI.
- `--password` (`-p`): The password of the MongoDB server. Can also be included in the URI.
- `--config` (`-c`): The path to the config file to use.

# Other concepts

## Transactions

By default, `mongo-migrator` will run each of the migrations in a transaction if the current database supports it. This behavior can be changed by changing the `transaction` setting (either using the CLI or in the config file).

If you want `mongo-migrator` to run all migrations in a single transaction, use the `group` setting.

When using transactions, please be aware of the [limitations](https://docs.mongodb.com/manual/core/transactions/) that come with them.

## Multiple databases

The best way to achieve a multi-database setup is to simply create multiple migrate-mongo configuration files. When running commands targeting a specific database, simply point the CLI to the correct config using the `--config` (`-c`) flag.

## Dynamic configuration

There are two possible way for dynamically configuring `mongo-migrator` (e.g. to target either staging or production in the CI). The first one is simply passing the database URL to the CLI. This flag will override the URL in the config file if provided.

If you want to use environment variables instead, the easiest way is to write the config file in Javascript and access the environment using `process.env`.

# API Usage

`mongo-migrator` can also be invoked programmatically, using the API.

The API is structured very similar to the CLI commands and most of the explanations above hold true for the API methods as well.

The most important public methods are the following:

### `readConfig(path?: string): Promise<Config>`

Tries to read the config file from the specified path.

### `create(directory: string, name: string): Promise<string>`

Creates a new migration with the specified name in the specified directory.

### `migrate(config: Config): Promise<void>`

Runs migrations using the provided config.

### `rollback(config: Config): Promise<void>`

Rolls back migrations using the provided config.

### `status(config: Config): Promise<MigrationStatus[]>`

Returns the status of all the migrations for the provided config.
