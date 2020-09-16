import { ObjectId } from 'mongodb';

export interface ChangelogEntry {
  _id: ObjectId;
  date: Date;
  migrations: string[];
}
