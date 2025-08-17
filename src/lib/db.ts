import getMongoClient from './mongodb';

export async function getDb() {
  const client = await getMongoClient();
  const dbName = process.env.MONGODB_DB || 'tripdiary';
  return client.db(dbName);
}
