'use client';

import { useEffect, useMemo } from 'react';
import { Box } from '@mui/material';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTripStore } from '@/store/tripStore';

export default function ThailandMap() {
  const { trips } = useTripStore();

  // Get all unique locations from all trips using useMemo
  const locations = useMemo(() => trips.flatMap((trip) =>
    trip.entries.map((entry) => ({
      ...entry.location,
      tripName: trip.name,
      timestamp: entry.timestamp,
    }))
  ), [trips]);

  useEffect(() => {
    // Fix Leaflet marker icon issue in Next.js
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'leaflet/images/marker-icon-2x.png',
      iconUrl: 'leaflet/images/marker-icon.png',
      shadowUrl: 'leaflet/images/marker-shadow.png',
    });
  }, []);

  return (
    <Box sx={{ height: '100%', width: '100%' }}>
      <MapContainer
        center={[13.7563, 100.5018]} // Bangkok coordinates
        zoom={6}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {locations.map((location, index) => (
          <Marker
            key={`${location.lat}-${location.lng}-${index}`}
            position={[location.lat, location.lng]}
          >
            <Popup>
              <div>
                <h3>{location.name}</h3>
                <p>ทริป: {location.tripName}</p>
                <p>วันที่: {new Date(location.timestamp).toLocaleDateString('th-TH')}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
}
