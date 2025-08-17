'use client';

import dynamic from 'next/dynamic';

// Dynamically import the map component to avoid SSR issues with Leaflet
const ThailandMap = dynamic(
  () => import('@/components/ThailandMap'),
  { ssr: false }
);

export default function MapPage() {
  return <ThailandMap />;
}
