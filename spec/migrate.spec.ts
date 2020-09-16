import { ObjectId } from 'mongodb';
import { ChangelogEntry, Config, migrate } from '../src';
import { DatabaseHelper } from './util/database-helper';
import { getDefaultConfig } from './util/default-config';
import { TestDatabase } from './util/test-database';

describe('migrate', () => {
  const database = new TestDatabase();
  const testDB = new DatabaseHelper('Test');

  beforeAll(async () => {
    await database.start();
    await testDB.connect(database.uri);
  });

  beforeEach(async () => {
    await testDB.reset();
  });

  afterAll(async () => {
    await testDB.disconnect();
    await database.stop();
  });

  it('should apply the pending migrations', async () => {
    await migrate(getDefaultConfig(database));

    const collections = await testDB.db.listCollections().toArray();
    expect(collections.map(c => c.name)).toContain('test');
  });

  it('should add applied migrations to the database', async () => {
    await migrate(getDefaultConfig(database));

    const appliedMigration = await testDB.getDocument<ChangelogEntry>('changelog', {
      migrations: 'create-test-collection'
    });
    expect(appliedMigration).toBeTruthy();
  });

  it('should not run previously applied migrations', async () => {
    await testDB.insertData({
      changelog: [{ _id: new ObjectId(), date: new Date(), migrations: ['create-test-collection'] }] as ChangelogEntry[]
    });

    await migrate(getDefaultConfig(database));

    const collections = await testDB.db.listCollections().toArray();
    expect(collections.map(c => c.name)).not.toContain('test');
  });

  it('should not apply the same migration twice', async () => {
    await migrate(getDefaultConfig(database));
    let documentCount = await testDB.db.collection('test').countDocuments();
    expect(documentCount).toEqual(1);

    await migrate(getDefaultConfig(database));

    documentCount = await testDB.db.collection('test').countDocuments();
    expect(documentCount).toEqual(1);
  });

  it('should respect the provided migrations collection', async () => {
    const collection = 'migrations';

    const config = getDefaultConfig(database, [
      { name: 'Test', files: ['./spec/migrations/**/*'], changelog: collection }
    ]);
    await migrate(config);

    const collections = await testDB.db.listCollections().toArray();
    expect(collections.map(c => c.name)).toContain(collection);
  });

  it('should not do anything if there are no migrations', async () => {
    const config: Config = getDefaultConfig(database, [{ name: 'Test' }]);
    await migrate(config);

    const collections = await testDB.db.listCollections().toArray();
    expect(collections.map(c => c.name)).not.toContain('test');
  });

  it('should not alter the changelog if there are no pending migrations', async () => {
    await testDB.insertData({
      changelog: [
        { _id: new ObjectId(), date: new Date(), migrations: ['create-test-collection', 'other-migration'] }
      ] as ChangelogEntry[]
    });

    await migrate(getDefaultConfig(database));

    const changelogLength = await testDB.db.collection<ChangelogEntry>('changelog').countDocuments();
    expect(changelogLength).toEqual(1);
  });

  describe('multiple databases', () => {
    const otherDB = new DatabaseHelper('Other');

    beforeAll(async () => {
      await otherDB.connect(database.uri);
    });

    beforeEach(async () => {
      await otherDB.reset();
    });

    afterAll(async () => {
      await otherDB.disconnect();
    });

    it('should run the migrations for both databases', async () => {
      await migrate(
        getDefaultConfig(database, [
          { name: testDB.name, files: ['./spec/migrations/**/*'] },
          { name: otherDB.name, files: ['./spec/migrations/**/*'] }
        ])
      );

      const testDBCollections = await testDB.db.listCollections().toArray();
      expect(testDBCollections.map(c => c.name)).toContain('test');

      const otherDBCollections = await otherDB.db.listCollections().toArray();
      expect(otherDBCollections.map(c => c.name)).toContain('test');
    });

    it.skip('should use the same ID in both generated changelogs', async () => {
      await migrate(
        getDefaultConfig(database, [
          { name: testDB.name, files: ['./spec/migrations/**/*'] },
          { name: otherDB.name, files: ['./spec/migrations/**/*'] }
        ])
      );

      const testDBChangelogEntry = await testDB.getDocument<ChangelogEntry>('changelog', {});
      expect(testDBChangelogEntry).toBeTruthy();

      const otherDBChangelogEntry = await otherDB.getDocument<ChangelogEntry>('changelog', {});
      expect(otherDBChangelogEntry).toBeTruthy();

      expect(testDBChangelogEntry!._id).toEqual(otherDBChangelogEntry!._id);
    });

    it('should only create a changelog entry if the database changed', async () => {
      await testDB.insertData({
        changelog: [
          { _id: new ObjectId(), date: new Date(), migrations: ['create-test-collection', 'other-migration'] }
        ] as ChangelogEntry[]
      });

      await migrate(
        getDefaultConfig(database, [
          { name: testDB.name, files: ['./spec/migrations/*'] },
          { name: otherDB.name, files: ['./spec/migrations/*'] }
        ])
      );

      const testDBChangelogLength = await testDB.db.collection('changelog').countDocuments();
      expect(testDBChangelogLength).toEqual(1);

      const testDBChangelogEntry = await testDB.getDocument<ChangelogEntry>('changelog', {});
      const otherDBChangelogEntry = await otherDB.getDocument<ChangelogEntry>('changelog', {});
      expect(testDBChangelogEntry!._id).not.toEqual(otherDBChangelogEntry!._id);
    });
  });
});
