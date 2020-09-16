import { ObjectId } from 'mongodb';
import { ChangelogEntry, MigrationFile, rollback } from '../src';
import { DatabaseHelper } from './util/database-helper';
import { getDefaultConfig } from './util/default-config';
import { TestDatabase } from './util/test-database';

describe('rollback', () => {
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

  it('should revert the most recent migration', async () => {
    await mockApplyMigration(testDB, 'create-test-collection');

    await rollback(getDefaultConfig(database));

    const collections = await testDB.db.listCollections().toArray();
    expect(collections.map(c => c.name)).not.toContain('test');
  });

  it('should remove the rollbacked migrations from the changelog', async () => {
    await mockApplyMigration(testDB, 'create-test-collection');

    await rollback(getDefaultConfig(database));

    const appliedMigration = await testDB.getDocument<ChangelogEntry>('changelog', {
      migrations: 'create-test-collection'
    });
    expect(appliedMigration).toBeNull();
  });

  it('should do nothing if there are no applied migrations in the changelog', async () => {
    await expect(rollback(getDefaultConfig(database))).resolves.not.toThrow();
  });

  it('should throw an error if the migrations to-be-rollbacked are not included in the provided migration directories', async () => {
    await addChangelog(testDB, 'i-was-deleted');

    await expect(rollback(getDefaultConfig(database))).rejects.toThrow(Error);
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

    it('should roll back migrations in both databases', async () => {
      await mockApplyMigration(testDB, 'create-test-collection');
      await mockApplyMigration(otherDB, 'create-test-collection');

      await rollback(
        getDefaultConfig(database, [
          { name: testDB.name, files: ['./spec/migrations/**/*'] },
          { name: otherDB.name, files: ['./spec/migrations/**/*'] }
        ])
      );

      const testDBCollections = await testDB.db.listCollections().toArray();
      expect(testDBCollections.map(c => c.name)).not.toContain('test');

      const otherDBCollections = await otherDB.db.listCollections().toArray();
      expect(otherDBCollections.map(c => c.name)).not.toContain('test');
    });

    it.skip('should only roll back the most recent migration amongst all databases', async () => {
      await mockApplyMigration(testDB, 'create-test-collection', { date: new Date(Date.now() - 10000) });
      await mockApplyMigration(testDB, 'other-migration', { date: new Date() });
      await mockApplyMigration(otherDB, 'create-test-collection', { date: new Date(Date.now() - 10000) });

      await rollback(
        getDefaultConfig(database, [
          { name: testDB.name, files: ['./spec/migrations/**/*'] },
          { name: otherDB.name, files: ['./spec/migrations/**/*'] }
        ])
      );

      const testDBDoc = await testDB.getDocument('test', { text: 'test' });
      expect(testDBDoc).toBeTruthy();

      const otherDBDoc = await otherDB.db.listCollections().toArray();
      expect(otherDBDoc.map(c => c.name)).toContain('test');
    });
  });
});

async function mockApplyMigration(database: DatabaseHelper, name: string, overrides?: Partial<ChangelogEntry>) {
  const migration: MigrationFile = await import(`./migrations/${name}.ts`);
  await migration.up(database.db);

  await addChangelog(database, name, overrides);
}

async function addChangelog(
  database: DatabaseHelper,
  name: string,
  overrides?: Partial<ChangelogEntry>
): Promise<void> {
  await database.insertData({
    changelog: [{ _id: new ObjectId(), date: new Date(), ...overrides, migrations: [name] }] as ChangelogEntry[]
  });
}
