import { z } from 'zod';

export const ImageMetaSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  width: z.number().optional(),
  height: z.number().optional(),
  mime: z.string().optional(),
});

export const DiaryEntryCreateSchema = z.object({
  text: z.string().min(1),
  images: z.array(ImageMetaSchema).default([]),
  locationName: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const TripCreateSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  province: z.string().optional(),
  startedAt: z.string().optional(),
  endedAt: z.string().optional(),
  vehicle: z
    .object({
      id: z.string(),
      brand: z.string(),
      model: z.string(),
      plate: z.string().optional(),
      notes: z.string().optional(),
    })
    .optional(),
});

export type DiaryEntryCreateInput = z.infer<typeof DiaryEntryCreateSchema>;
export type TripCreateInput = z.infer<typeof TripCreateSchema>;
