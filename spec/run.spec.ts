import { ObjectId } from 'mongodb';
import { Config } from '../src/config/config';
import { run } from '../src/run';
import { ChangelogEntry } from '../src/types/applied-migration';
import { TestDatabase } from './util/test-database';

describe('run', () => {
  const database = new TestDatabase('Test');

  beforeAll(async () => {
    await database.start();
  });

  beforeEach(async () => {
    await database.reset();
  });

  afterAll(async () => {
    await database.stop();
  });

  it('should apply the pending migrations', async () => {
    await run(getConfig(database));

    const collections = await database.db.listCollections().toArray();
    expect(collections.map(c => c.name)).toContain('test');
  });

  it('should add applied migrations to the database', async () => {
    await run(getConfig(database));

    const appliedMigration = await database.getDocument<ChangelogEntry>('changelog', {
      migrations: 'create-test-collection'
    });
    expect(appliedMigration).toBeTruthy();
  });

  it('should not run previously applied migrations', async () => {
    await database.insertData({
      changelog: [{ _id: new ObjectId(), date: new Date(), migrations: ['create-test-collection'] }] as ChangelogEntry[]
    });

    await run(getConfig(database));

    const collections = await database.db.listCollections().toArray();
    expect(collections.map(c => c.name)).not.toContain('test');
  });

  it('should not apply the same migration twice', async () => {
    await run(getConfig(database));
    let documentCount = await database.db.collection('test').countDocuments();
    expect(documentCount).toEqual(1);

    await run(getConfig(database));

    documentCount = await database.db.collection('test').countDocuments();
    expect(documentCount).toEqual(1);
  });

  it('should respect the provided migrations collection', async () => {
    const collection = 'migrations';
    const config: Config = {
      ...getConfig(database),
      databases: [{ name: 'Test', files: ['./spec/migrations/**/*'], changelog: collection }]
    };

    await run(config);

    const collections = await database.db.listCollections().toArray();
    expect(collections.map(c => c.name)).toContain(collection);
  });

  it('should not do anything if there are no migrations', async () => {
    const config: Config = {
      ...getConfig(database),
      databases: [{ name: 'Test' }]
    };

    await run(config);

    const collections = await database.db.listCollections().toArray();
    expect(collections.map(c => c.name)).not.toContain('test');
  });

  it('should not alter the changelog if there are no pending migrations', async () => {
    await database.insertData({
      changelog: [{ _id: new ObjectId(), date: new Date(), migrations: ['create-test-collection'] }] as ChangelogEntry[]
    });

    await run(getConfig(database));

    const changelogLength = await database.db.collection<ChangelogEntry>('changelog').countDocuments();
    expect(changelogLength).toEqual(1);
  });
});

function getConfig(database: TestDatabase): Config {
  return {
    url: database.uri,
    mongoClientOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    databases: [{ name: 'Test', files: ['./spec/migrations/**/*'] }]
  };
}
