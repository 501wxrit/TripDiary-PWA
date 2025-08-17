export interface Vehicle {
  id: string;
  name: string;
  type: 'car' | 'motorcycle' | 'other';
  description?: string;
  image?: string;
}

export interface Location {
  lat: number;
  lng: number;
  name: string;
  address?: string;
}

// export interface DiaryEntry {
//   id: string;
//   timestamp: string;
//   location: Location;
//   description: string;
//   images: string[];
//   tags?: string[];
// }

// export interface Trip {
//   id: string;
//   name: string;
//   startDate: string;
//   endDate?: string;
//   vehicle: Vehicle;
//   entries: DiaryEntry[];
//   coverImage?: string;
//   description?: string;
//   province?: string;
// }

export type ID = string;


// New System Types
export interface ImageMeta {
  id: ID;           // public_id ของ Cloudinary
  url: string;      // secure_url
  width?: number;
  height?: number;
  mime?: string;
}

export interface DiaryEntry {
  _id?: string;
  id: ID;
  createdAt: string;
  text: string;
  images: ImageMeta[];
  locationName?: string;
  lat?: number;
  lng?: number;
}

export interface Vehicle {
  id: ID;
  brand: string;
  model: string;
  plate?: string;
  notes?: string;
}

export interface Trip {
  _id?: string;
  id: ID;
  name: string;
  province?: string;
  startedAt?: string;
  endedAt?: string;
  entries: DiaryEntry[];
  vehicle?: Vehicle;
  description?: string;
  coverImage?: string;
  startDate?: string;
  endDate?: string;
}
