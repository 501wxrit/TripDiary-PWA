import { NextRequest } from 'next/server';
import { DiaryEntryCreateSchema } from '@/lib/validation';
import { addEntry, getTripById } from '@/data/trips';
import { v4 as uuid } from 'uuid';
import type { DiaryEntry } from '@/types/trip';

export const runtime = 'nodejs';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const tripId = params.id;
    const trip = await getTripById(tripId);
    if (!trip) return new Response(JSON.stringify({ error: 'Trip not found' }), { status: 404 });

    const body = await req.json();
    const parsed = DiaryEntryCreateSchema.parse(body);

    const entry: DiaryEntry = {
      id: uuid(),
      createdAt: new Date().toISOString(),
      text: parsed.text,
      images: parsed.images,
      locationName: parsed.locationName,
      lat: parsed.lat,
      lng: parsed.lng,
    };

    await addEntry(tripId, entry);
    return Response.json({ entry }, { status: 201 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e.message }), { status: 400 });
  }
}
