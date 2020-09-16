import { Db } from 'mongodb';

export async function up(db: Db): Promise<void> {
  await db.collection('test').updateOne({ text: 'test' }, { $set: { text: 'updated' } });
}

export async function down(db: Db): Promise<void> {
  await db.collection('test').updateOne({ text: 'update' }, { $set: { text: 'test' } });
}
