import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  await db.createCollection('test');
}

export async function down(db: Db): Promise<void> {
  await db.dropCollection('test');
}
