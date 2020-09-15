import { ObjectId } from 'mongodb';
import { Config } from '../src/config/config';
import { AppliedMigration } from '../src/migrations/applied-migration';
import { run } from '../src/run';
import { TestDatabase } from './util/database';

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

    const appliedMigration = await database.getDocument<AppliedMigration>('migrations', {
      name: 'create-test-collection'
    });
    expect(appliedMigration).toBeTruthy();
  });

  it('should not run previously applied migrations', async () => {
    await database.insertData({
      migrations: [{ _id: new ObjectId(), date: new Date(), name: 'create-test-collection' }] as AppliedMigration[]
    });

    await run(getConfig(database));

    const collections = await database.db.listCollections().toArray();
    expect(collections.map(c => c.name)).not.toContain('test');
  });
});

function getConfig(database: TestDatabase): Config {
  return {
    url: database.uri,
    mongoClientOptions: { useNewUrlParser: true, useUnifiedTopology: true },
    databases: [{ name: 'Test', files: ['./spec/migrations/**/*'] }]
  };
}
