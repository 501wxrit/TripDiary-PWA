'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import localforage from 'localforage';
import { Trip, DiaryEntry, Vehicle } from '@/types/trip';

interface TripState {
  trips: Trip[];
  currentTrip: Trip | null;
  vehicles: Vehicle[];
  loading: boolean;
  error: string | null;

  addTrip: (trip: Trip) => void;
  addDiaryEntry: (tripId: string, entry: DiaryEntry) => void;
  addVehicle: (vehicle: Vehicle) => void;
  setCurrentTrip: (tripId: string) => void;
  deleteTrip: (tripId: string) => void;
  deleteDiaryEntry: (tripId: string, entryId: string) => void;
  updateTrip: (tripId: string, updates: Partial<Trip>) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAll: () => void;
  exportData: () => void;
  importData: (file: File) => void;
  deleteVehicle: (id: string) => void;
}

const STORAGE_KEY = 'trip-storage';

/** ---------- IndexedDB storage via localforage (แทน localStorage) ---------- */
const lf =
  typeof window !== 'undefined'
    ? localforage.createInstance({
        name: 'tripdiary',
        storeName: 'kv',
        description: 'Persisted state for TripDiary',
      })
    : null;

const idbStorage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    if (!lf) return null;
    // ลองอ่านจาก IndexedDB ก่อน
    let value = await lf.getItem<string>(name);
    // migrate อัตโนมัติจาก localStorage ถ้ายังมีของเก่า
    if (!value && typeof window !== 'undefined') {
      const legacy = window.localStorage.getItem(name);
      if (legacy) {
        await lf.setItem(name, legacy);
        try { window.localStorage.removeItem(name); } catch {}
        value = legacy;
      }
    }
    return value ?? null;
  },
  setItem: async (name: string, value: string) => {
    if (!lf) return;
    await lf.setItem(name, value);
  },
  removeItem: async (name: string) => {
    if (!lf) return;
    await lf.removeItem(name);
  },
}));

/** ---------- ตัดข้อมูลหนัก (data URL/base64) ออกจาก state ก่อน persist ---------- */
function stripHeavy(state: any) {
  const cleanTrips = (state.trips ?? []).map((t: any) => ({
    ...t,
    // ถ้า coverImage เป็น data: ไม่ต้อง persist
    coverImage:
      typeof t.coverImage === 'string' && t.coverImage.startsWith('data:')
        ? undefined
        : t.coverImage,
    entries: (t.entries ?? []).map((e: any) => ({
      ...e,
      images: (e.images ?? [])
        .map((img: any) => {
          // รองรับทั้ง string และ object
          if (typeof img === 'string') {
            // ทิ้ง base64
            if (img.startsWith('data:')) return null;
            // เก็บเฉพาะเป็น { url } เพื่อให้เบา
            return { url: img };
          }
          if (img?.url && typeof img.url === 'string' && img.url.startsWith('data:')) {
            return null;
          }
          return img;
        })
        .filter(Boolean),
    })),
  }));
  return { ...state, trips: cleanTrips };
}

export const useTripStore = create<TripState>()(
  persist(
    (set, get) => ({
      trips: [],
      currentTrip: null,
      vehicles: [],
      loading: false,
      error: null,

      addTrip: (trip) =>
        set((state) => ({
          trips: [...state.trips, trip],
          error: null,
        })),

      addDiaryEntry: (tripId, entry) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? { ...trip, entries: [...trip.entries, entry] }
              : trip
          ),
          error: null,
        })),

      addVehicle: (vehicle) =>
        set((state) => ({
          vehicles: [...state.vehicles, vehicle],
          error: null,
        })),

      deleteVehicle: (id: string) =>
        set((state) => ({ vehicles: state.vehicles.filter((v) => v.id !== id) })),

      setCurrentTrip: (tripId) =>
        set((state) => ({
          currentTrip: state.trips.find((trip) => trip.id === tripId) || null,
          error: null,
        })),

      deleteTrip: (tripId) =>
        set((state) => ({
          trips: state.trips.filter((trip) => trip.id !== tripId),
          currentTrip: state.currentTrip?.id === tripId ? null : state.currentTrip,
          error: null,
        })),

      deleteDiaryEntry: (tripId, entryId) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId
              ? {
                  ...trip,
                  entries: trip.entries.filter((entry) => entry.id !== entryId),
                }
              : trip
          ),
          error: null,
        })),

      updateTrip: (tripId, updates) =>
        set((state) => ({
          trips: state.trips.map((trip) =>
            trip.id === tripId ? { ...trip, ...updates } : trip
          ),
          currentTrip:
            state.currentTrip?.id === tripId
              ? { ...state.currentTrip, ...updates }
              : state.currentTrip,
          error: null,
        })),

      setError: (error) => set({ error }),
      setLoading: (loading) => set({ loading }),

      clearAll: () => {
        // ลบทั้ง IndexedDB key และ localStorage key เดิม
        (async () => {
          try { await lf?.removeItem(STORAGE_KEY); } catch {}
          try { localStorage.removeItem(STORAGE_KEY); } catch {}
        })();
        set({
          trips: [],
          currentTrip: null,
          vehicles: [],
          loading: false,
          error: null,
        });
      },

      exportData: () => {
        try {
          const data = {
            trips: get().trips,
            vehicles: get().vehicles,
          };
          const json = JSON.stringify(data, null, 2);
          const blob = new Blob([json], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `trip-diary-${Date.now()}.json`;
          a.click();
          URL.revokeObjectURL(url);
        } catch (err) {
          console.error('Export failed', err);
        }
      },

      importData: (file: File) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const parsed = JSON.parse(e.target?.result as string);
            if (
              parsed &&
              Array.isArray(parsed.trips) &&
              Array.isArray(parsed.vehicles)
            ) {
              set({
                trips: parsed.trips,
                vehicles: parsed.vehicles,
              });
            } else {
              alert('ไฟล์ไม่ถูกต้อง: ไม่มี trips หรือ vehicles');
            }
          } catch (err) {
            console.error('Import failed', err);
            alert('อ่านไฟล์ไม่สำเร็จ');
          }
        };
        reader.readAsText(file);
      },
    }),
    {
      name: STORAGE_KEY,
      version: 3,            // bump version เพื่อให้ migrate/partialize ทำงานกับ state เก่า
      storage: idbStorage,   // ✅ ใช้ IndexedDB (localforage) แทน localStorage
      partialize: (state) => stripHeavy(state),   // ✅ กัน base64/data: ก่อน persist
      migrate: (persisted: any, fromVersion: number) => {
        if (!persisted) return persisted;
        if (fromVersion < 3) return stripHeavy(persisted);
        return persisted;
      },
    }
  )
);
