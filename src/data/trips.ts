import { getDb } from '@/lib/db';
import type { Trip, DiaryEntry } from '@/types/trip';
import { ObjectId } from 'mongodb';

const COLLECTION = 'trips';

export async function listTrips(): Promise<Trip[]> {
  const db = await getDb();
  return db.collection<Trip>(COLLECTION).find({}).sort({ _id: -1 }).toArray();
}

export async function createTrip(trip: Trip): Promise<Trip> {
  const db = await getDb();
  const doc = { ...trip, entries: trip.entries ?? [] };
  const res = await db.collection<Trip>(COLLECTION).insertOne(doc);
  return { ...doc, _id: res.insertedId.toString() };
}

export async function getTripById(tripId: string): Promise<Trip | null> {
  const db = await getDb();
  return db.collection<Trip>(COLLECTION).findOne({ id: tripId });
}

export async function addEntry(tripId: string, entry: DiaryEntry) {
  const db = await getDb();
  await db.collection<Trip>(COLLECTION).updateOne(
    { id: tripId },
    { $push: { entries: entry } }
  );
}

export async function deleteTripById(tripId: string) {
  const db = await getDb();
  await db.collection<Trip>(COLLECTION).deleteOne({ id: tripId });
}
