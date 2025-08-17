'use client';

import React, { useState } from 'react';
import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import ClearIcon from '@mui/icons-material/Clear';
import { Vehicle, Trip } from '@/types/trip';
import { useTripStore } from '@/store/tripStore';
import { keyframes } from '@mui/system';
// import { v4 as uuid } from 'uuid';
import { genId } from '@/utils/id';

// รายชื่อจังหวัดในประเทศไทย
const provinces = [
  'กรุงเทพมหานคร', 'กระบี่', 'กาญจนบุรี', 'กาฬสินธุ์', 'กำแพงเพชร', 'ขอนแก่น', 'จันทบุรี', 'ฉะเชิงเทรา', 'ชลบุรี', 'ชัยนาท',
  'ชัยภูมิ', 'ชุมพร', 'เชียงราย', 'เชียงใหม่', 'ตรัง', 'ตราด', 'ตาก', 'นครนายก', 'นครปฐม', 'นครพนม', 'นครราชสีมา',
  'นครศรีธรรมราช', 'นครสวรรค์', 'นนทบุรี', 'นราธิวาส', 'น่าน', 'บึงกาฬ', 'บุรีรัมย์', 'ปทุมธานี', 'ประจวบคีรีขันธ์',
  'ปราจีนบุรี', 'ปัตตานี', 'พระนครศรีอยุธยา', 'พะเยา', 'พังงา', 'พัทลุง', 'พิจิตร', 'พิษณุโลก', 'เพชรบุรี', 'เพชรบูรณ์',
  'แพร่', 'ภูเก็ต', 'มหาสารคาม', 'มุกดาหาร', 'แม่ฮ่องสอน', 'ยโสธร', 'ยะลา', 'ร้อยเอ็ด', 'ระนอง', 'ระยอง',
  'ราชบุรี', 'ลพบุรี', 'ลำปาง', 'ลำพูน', 'เลย', 'ศรีสะเกษ', 'สกลนคร', 'สงขลา', 'สตูล', 'สมุทรปราการ', 'สมุทรสงคราม',
  'สมุทรสาคร', 'สระแก้ว', 'สระบุรี', 'สิงห์บุรี', 'สุโขทัย', 'สุพรรณบุรี', 'สุราษฎร์ธานี', 'สุรินทร์', 'หนองคาย', 'หนองบัวลำภู',
  'อ่างทอง', 'อำนาจเจริญ', 'อุดรธานี', 'อุตรดิตถ์', 'อุทัยธานี', 'อุบลราชธานี',
];

// ===== Animations =====
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

interface AddTripDialogProps {
  open: boolean;
  onClose: () => void;
  trip?: Trip;
  onSave?: (trip: Partial<Trip>) => void; // edit mode
}

export default function AddTripDialog({
  open,
  onClose,
  trip,
  onSave,
}: AddTripDialogProps) {
  const vehicles = useTripStore((s) => s.vehicles);
  const addTrip = useTripStore((s) => s.addTrip);

  const [tripName, setTripName] = useState(trip?.name || '');
  const [province, setProvince] = useState(trip?.province || '');
  const [coverImage, setCoverImage] = useState<string | null>(
    (trip as any)?.coverImage || null
  );
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [description, setDescription] = useState((trip as any)?.description || '');
  const [selectedVehicle, setSelectedVehicle] = useState<string>(trip?.vehicle?.id || '');
  const [startDate, setStartDate] = useState(
    (trip as any)?.startDate ? (trip as any).startDate.slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    (trip as any)?.endDate ? (trip as any).endDate.slice(0, 10) : ''
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  React.useEffect(() => {
    if (trip) {
      setTripName(trip.name || '');
      setProvince(trip.province || '');
      setCoverImage((trip as any)?.coverImage || null);
      setCoverFile(null);
      setDescription((trip as any)?.description || '');
      setSelectedVehicle(trip.vehicle?.id || '');
      setStartDate((trip as any)?.startDate ? (trip as any).startDate.slice(0, 10) : '');
      setEndDate((trip as any)?.endDate ? (trip as any).endDate.slice(0, 10) : '');
    } else {
      setTripName('');
      setProvince('');
      setCoverImage(null);
      setCoverFile(null);
      setDescription('');
      setSelectedVehicle('');
      setStartDate('');
      setEndDate('');
    }
  }, [trip, open]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverFile(file);
      const reader = new FileReader();
      reader.onload = (ev) => setCoverImage(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleClearImage = () => {
    setCoverFile(null);
    setCoverImage(null);
  };

  // อัปโหลดรูปปกไป Cloudinary (unsigned)
  const uploadCoverIfAny = async (): Promise<string | null> => {
    if (!coverFile) return coverImage || null;

    const cloud = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
    const preset = process.env.NEXT_PUBLIC_CLOUDINARY_UNSIGNED_PRESET!;
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER || 'tripdiary';

    if (!cloud || !preset) {
      throw new Error('Cloudinary ยังไม่พร้อม: ตรวจ .env.local (NEXT_PUBLIC_CLOUDINARY_*) แล้วรันใหม่');
    }

    const form = new FormData();
    form.append('file', coverFile);
    form.append('upload_preset', preset);
    form.append('folder', folder);

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
      method: 'POST',
      body: form,
    });
    if (!res.ok) {
      const j = await res.json().catch(() => ({}));
      throw new Error(j?.error?.message || 'Upload failed');
    }
    const j = await res.json();
    return j.secure_url as string;
  };

  const handleSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      const vehicleObj = vehicles.find((v) => v.id === selectedVehicle) as Vehicle | undefined;

      // เตรียมเวลาเป็น ISO
      const startedAtISO = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
      const endedAtISO = endDate ? new Date(endDate).toISOString() : undefined;

      if (trip && onSave) {
        // ===== Edit Mode =====
        let coverUrl: string | null = coverImage;
        if (coverFile) {
          coverUrl = await uploadCoverIfAny();
        }
        onSave({
          name: tripName,
          province,
          ...(coverUrl ? { coverImage: coverUrl as any } : {}),
          description: description as any,
          vehicle: vehicleObj as Vehicle,
          ...(startDate ? { startDate: startedAtISO as any } : {}),
          ...(endDate ? { endDate: endedAtISO as any } : {}),
        });
      } else {
        // ===== Add Mode (ตัดการเรียก /api/trips ออก) =====
        const id = genId(); // หรือ Date.now().toString()

        // อัปโหลดปกถ้ามี
        let coverUrl: string | null = null;
        if (coverFile) {
          try {
            coverUrl = await uploadCoverIfAny();
          } catch (e: any) {
            console.error('Upload cover failed:', e?.message || e);
            // ไม่โยนทิ้ง เพื่อให้สร้างทริปได้แม้ไม่มีรูปปก
          }
        }

        // กัน schema: ensure brand/model เป็น string
        const vehiclePayload: Vehicle = (vehicleObj as Vehicle) || {
          id: selectedVehicle || id,
          name: 'ไม่ระบุ',
          type: 'other',
          brand: '',
          model: '',
        };

        const newTrip: Trip = {
          id,
          name: tripName,
          province,
          startDate: startedAtISO as any,
          endDate: endedAtISO as any,
          vehicle: vehiclePayload,
          entries: [],
          ...(coverUrl ? { coverImage: coverUrl as any } : {}),
          ...(description ? { description: description as any } : {}),
        };

        // ✅ บันทึกตรงลง Zustand store — ไม่เรียก API
        addTrip(newTrip);
      }

      onClose();
    } catch (e: any) {
      console.error(e);
      setError(e?.message || 'เกิดข้อผิดพลาด');
    } finally {
      setBusy(false);
    }
  };

  const isInvalidRange =
    Boolean(startDate && endDate) &&
    new Date(startDate).getTime() > new Date(endDate).getTime();

  const canSubmit = !!tripName && !!selectedVehicle && !isInvalidRange && !busy;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          background: '#fff',
          border: '1px solid rgba(0, 0, 0, 0.1)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        },
      }}
    >
      <DialogTitle
        sx={{
          pb: 1.5,
          fontWeight: '500',
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        {trip ? 'แก้ไขทริป' : 'เพิ่มทริปใหม่'}
        <Box
          sx={{
            mt: 1,
            width: 80,
            height: 4,
            borderRadius: 2,
            mx: 0,
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            backgroundImage:
              'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
            backgroundSize: '200% 100%',
            animation: `${shimmer} 2s infinite linear`,
          }}
        />
      </DialogTitle>

      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="ชื่อทริป (สถานที่เป้าหมาย)"
            value={tripName}
            onChange={(e) => setTripName(e.target.value)}
            fullWidth
            required
          />

          <FormControl fullWidth>
            <InputLabel>จังหวัด</InputLabel>
            <Select
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              label="จังหวัด"
              MenuProps={{ PaperProps: { sx: { maxHeight: 360 } } }}
            >
              {provinces.map((prov) => (
                <MenuItem key={prov} value={prov}>
                  {prov}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              component="label"
              startIcon={<ImageIcon />}
              disabled={busy}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                borderRadius: '50px',
                px: 3,
                textTransform: 'none',
                fontWeight: 'bold',
                animation: `${pulse} 2s infinite`,
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  animation: 'none',
                },
              }}
            >
              แนบรูปภาพปก
              <input type="file" accept="image/*" hidden onChange={handleImageChange} />
            </Button>

            {coverImage && (
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: 'divider',
                  position: 'relative',
                  boxShadow: 1,
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={coverImage}
                  alt="cover preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <Tooltip title="ลบรูปภาพปก">
                  <IconButton
                    size="small"
                    onClick={handleClearImage}
                    sx={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      bgcolor: 'background.paper',
                      border: '1px solid',
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            )}
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 2 }}>
            <TextField
              label="วันที่ไป"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="วันที่กลับ"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
          </Box>

          {isInvalidRange && (
            <Typography variant="body2" color="error" sx={{ mt: -1 }}>
              ช่วงวันที่ไม่ถูกต้อง: วันที่กลับควรอยู่หลังวันที่ไป
            </Typography>
          )}

          <FormControl fullWidth>
            <InputLabel>พาหนะ</InputLabel>
            <Select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              label="พาหนะ"
            >
              {vehicles.map((vehicle) => (
                <MenuItem key={vehicle.id} value={vehicle.id}>
                  {(vehicle as any).name ??
                    `${(vehicle as any).brand ?? 'พาหนะ'} ${(vehicle as any).model ?? ''}`}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            label="คำอธิบาย"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={3}
            fullWidth
          />

          {error && (
            <Typography color="error" variant="body2">
              {error}
            </Typography>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          disabled={busy}
          sx={{
            borderRadius: '50px',
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          ยกเลิก
        </Button>

        <Tooltip
          title={
            !tripName
              ? 'กรอกชื่อทริปก่อน'
              : !selectedVehicle
              ? 'เลือกพาหนะก่อน'
              : isInvalidRange
              ? 'ช่วงวันที่ไม่ถูกต้อง'
              : ''
          }
          disableHoverListener={canSubmit}
        >
          <span>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit}
              variant="contained"
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                borderRadius: '50px',
                px: 4,
                fontWeight: 'bold',
                textTransform: 'none',
                animation: canSubmit ? `${pulse} 2s infinite` : 'none',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  animation: 'none',
                },
              }}
            >
              {busy ? 'กำลังบันทึก…' : trip ? 'บันทึก' : 'เพิ่มทริป'}
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
