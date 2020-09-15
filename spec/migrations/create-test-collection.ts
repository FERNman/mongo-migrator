import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  await db.collection('test').insertOne({ text: 'test' });
}

export async function down(db: Db): Promise<void> {
  await db.dropCollection('test');
}
