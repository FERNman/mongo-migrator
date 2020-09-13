import { Config } from '../src/config/config';
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
    const config: Config = {
      url: database.uri,
      databases: [{ name: 'Test', files: ['./spec/migrations/**/*'] }]
    };

    await run(config);

    const collections = await database.db.listCollections().toArray();
    expect(collections.map(c => c.name)).toEqual(['test']);
  });
});
