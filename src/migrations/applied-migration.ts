import { ObjectId } from 'mongodb';

export interface AppliedMigration {
  _id: ObjectId;
  name: string;
  date: Date;
}
