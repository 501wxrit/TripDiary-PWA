'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
const MapPicker = dynamic(() => import('./MapPicker'), { ssr: false });

import ImageIcon from '@mui/icons-material/Image';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from '@mui/material';

import { useTripStore } from '@/store/tripStore';
import type { DiaryEntry } from '@/types/trip';

interface Props {
  open: boolean;
  onClose: () => void;
  tripId: string;
}

export default function AddDiaryEntryDialog({ open, onClose, tripId }: Props) {
  const { addDiaryEntry } = useTripStore();

  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [coordinates, setCoordinates] = useState<{ lat: string; lng: string }>({ lat: '', lng: '' });

  // เก็บไฟล์จริงสำหรับอัปโหลด + พรีวิว (base64) เพื่อแสดงผลเท่านั้น
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // ========== ดึงพิกัดอัตโนมัติเมื่อเปิด ==========
  useEffect(() => {
    if (open && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setCoordinates({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        });
      });
    }
  }, [open]);

  // ========== reverse geocoding จากพิกัด → ชื่อสถานที่ ==========
  useEffect(() => {
    const fetchPlaceName = async () => {
      if (!coordinates.lat || !coordinates.lng) return;
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coordinates.lat}&lon=${coordinates.lng}&accept-language=th`
        );
        const data = await res.json();
        if (data?.display_name) setLocation(data.display_name);
      } catch {
        /* เงียบไว้ */
      }
    };
    fetchPlaceName();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coordinates.lat, coordinates.lng]);

  // ========== อัปโหลดหลายไฟล์ขึ้น Cloudinary (unsigned) ==========
  async function uploadMany(files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET;
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'tripdiary';

    if (!cloud || !preset) {
      throw new Error('Cloudinary ยังไม่พร้อม: ตรวจ .env.local (NEXT_PUBLIC_CLOUDINARY_*) และรีสตาร์ท dev server');
    }

    const urls: string[] = [];
    for (const f of files) {
      const form = new FormData();
      form.append('file', f);
      form.append('upload_preset', preset);
      form.append('folder', folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
        method: 'POST',
        body: form,
      });
      if (!res.ok) {
        let msg = 'อัปโหลดรูปไม่สำเร็จ';
        try {
          const j = await res.json();
          msg = j?.error?.message || msg;
        } catch {}
        throw new Error(msg);
      }
      const j = await res.json();
      urls.push(j.secure_url as string);
    }
    return urls;
  }

  // ========== เลือกรูป: เก็บไฟล์ + ทำ preview ==========
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setImageFiles((prev) => [...prev, ...files]);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPreviews((prev) => [...prev, (ev.target?.result as string) || '']);
      };
      reader.readAsDataURL(file);
    });
  };

  // ========== กดใช้พิกัด (ปุ่มมือ) ==========
  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert('อุปกรณ์นี้ไม่รองรับการดึงพิกัด GPS');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoordinates({
          lat: pos.coords.latitude.toString(),
          lng: pos.coords.longitude.toString(),
        });
      },
      (err) => {
        alert('ไม่สามารถดึงพิกัดจาก GPS ได้: ' + err.message);
      }
    );
  };

  // ========== Validate พิกัด ==========
  const isValidCoordinates = () => {
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);
    return !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  };

  // ========== บันทึก ==========
  const handleSubmit = async () => {
    // 1) อัปโหลดรูปทั้งหมดขึ้น Cloudinary → ได้ URL
    let uploadedUrls: string[] = [];
    try {
      uploadedUrls = await uploadMany(imageFiles);
    } catch (e: any) {
      console.error('uploadMany failed:', e?.message || e);
      alert(e?.message || 'อัปโหลดรูปไม่สำเร็จ');
      // อนุญาตให้บันทึกได้แม้ไม่มีรูป
    }

    // 2) สร้าง entry ให้ตรงกับ type ที่หน้าแสดงผลคุณใช้อยู่ (images: string[])
    const entry: DiaryEntry = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      text: description,
      images: uploadedUrls as any, // โปรเจกต์คุณใช้ string[] อยู่แล้วตามหน้าแสดงผล
      locationName: location,
      lat: parseFloat(coordinates.lat),
      lng: parseFloat(coordinates.lng),
    };

    // 3) เซฟลง Zustand store ตรง ๆ
    addDiaryEntry(tripId, entry);

    // 4) reset & ปิด dialog
    onClose();
    setLocation('');
    setDescription('');
    setCoordinates({ lat: '', lng: '' });
    setImageFiles([]);
    setPreviews([]);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>เพิ่มบันทึกการเดินทาง</DialogTitle>
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          <TextField
            label="สถานที่"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            fullWidth
          />

          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              label="ละติจูด"
              value={coordinates.lat}
              onChange={(e) => setCoordinates((prev) => ({ ...prev, lat: e.target.value }))}
              fullWidth
              error={coordinates.lat !== '' && !isValidCoordinates()}
              helperText={coordinates.lat !== '' && !isValidCoordinates() ? 'ละติจูดไม่ถูกต้อง' : ''}
            />
            <TextField
              label="ลองจิจูด"
              value={coordinates.lng}
              onChange={(e) => setCoordinates((prev) => ({ ...prev, lng: e.target.value }))}
              fullWidth
              error={coordinates.lng !== '' && !isValidCoordinates()}
              helperText={coordinates.lng !== '' && !isValidCoordinates() ? 'ลองจิจูดไม่ถูกต้อง' : ''}
            />
            <Button onClick={handleGetGPS}>ใช้พิกัดปัจจุบัน</Button>
          </Box>

          {coordinates.lat && coordinates.lng && (
            <Box sx={{ my: 1 }}>
              <MapPicker
                lat={parseFloat(coordinates.lat)}
                lng={parseFloat(coordinates.lng)}
                onChange={(lat, lng) => setCoordinates({ lat: lat.toString(), lng: lng.toString() })}
              />
            </Box>
          )}

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Button variant="outlined" component="label" startIcon={<ImageIcon />}>
              แนบรูปภาพ
              <input type="file" accept="image/*" multiple hidden onChange={handleImageChange} />
            </Button>

            {previews.length > 0 && (
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {previews.map((img, idx) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={idx}
                    src={img}
                    alt="preview"
                    style={{
                      width: 48,
                      height: 48,
                      objectFit: 'cover',
                      borderRadius: 4,
                      border: '1px solid #eee',
                    }}
                  />
                ))}
              </Box>
            )}
          </Box>

          <TextField
            label="รายละเอียด"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>ยกเลิก</Button>
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={!location || !description || !isValidCoordinates()}
        >
          บันทึก
        </Button>
      </DialogActions>
    </Dialog>
  );
}
