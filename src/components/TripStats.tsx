'use client';

import { Box, Card, CardContent, Typography } from '@mui/material';
import { useTripStore } from '@/store/tripStore';
import { useMemo } from 'react';

/** ---- Types we control ---- */
type VehicleID = string | number;

interface TripEntry {
  images?: unknown[]; // ไม่รู้ชนิดรูปชัด ๆ แต่อย่างน้อยให้เป็นอาเรย์ได้
}

interface Trip {
  entries?: TripEntry[];
  vehicle?: { id?: VehicleID };
}

interface TripStatsData {
  totalTrips: number;
  totalLocations: number;
  totalPhotos: number;
  uniqueVehicles: number;
}

/** ---- Safe helpers ---- */
const toTrips = (val: unknown): Trip[] =>
  Array.isArray(val)
    ? (val.filter(Boolean) as unknown[]).map((t) => (t ?? {}) as Trip)
    : [];

const getEntries = (trip: Trip): TripEntry[] =>
  Array.isArray(trip.entries) ? trip.entries : [];

const getImages = (entry: TripEntry): unknown[] =>
  Array.isArray(entry.images) ? entry.images : [];

const getVehicleId = (trip: Trip): VehicleID | undefined => {
  const id = trip.vehicle?.id;
  return typeof id === 'string' || typeof id === 'number' ? id : undefined;
};

export default function TripStats() {
  // ดึงจาก store แบบหลวม ๆ แล้วค่อยแคบทีหลัง
  const tripsRaw = useTripStore((s: any) => s?.trips);
  const trips: Trip[] = toTrips(tripsRaw);

  const stats: TripStatsData = useMemo(() => {
    const totalTrips = trips.length;

    const totalLocations = trips.reduce((acc, trip) => {
      const entries = getEntries(trip);
      return acc + entries.length;
    }, 0);

    const totalPhotos = trips.reduce((acc, trip) => {
      const entries = getEntries(trip);
      const photosInTrip = entries.reduce((acc2, entry) => {
        const images = getImages(entry);
        return acc2 + images.length;
      }, 0);
      return acc + photosInTrip;
    }, 0);

    const uniqueVehicles = new Set(
      trips
        .map(getVehicleId)
        .filter((id): id is VehicleID => id !== undefined)
    ).size;

    return { totalTrips, totalLocations, totalPhotos, uniqueVehicles };
  }, [trips]);

  return (
    <Box sx={{ mb: 4 }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(2, 1fr)',
            sm: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              {stats.totalTrips}
            </Typography>
            <Typography color="text.secondary" align="center">
              ทริปทั้งหมด
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              {stats.totalLocations}
            </Typography>
            <Typography color="text.secondary" align="center">
              สถานที่
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              {stats.uniqueVehicles}
            </Typography>
            <Typography color="text.secondary" align="center">
              พาหนะ
            </Typography>
          </CardContent>
        </Card>

        <Card>
          <CardContent>
            <Typography variant="h6" align="center">
              {stats.totalPhotos}
            </Typography>
            <Typography color="text.secondary" align="center">
              รูปภาพ
            </Typography>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
