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
  Tooltip,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Divider,
  Typography,
} from '@mui/material';
import { keyframes } from '@mui/system';
import { useTripStore } from '@/store/tripStore';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { genId } from '@/utils/id';

/* ===== Animations ให้เข้าชุดกับ AddTripDialog ===== */
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

type VehicleType = 'car' | 'motorcycle' | 'other';

export default function AddVehicleDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [vehicleName, setVehicleName] = useState('');
  const [type, setType] = useState<VehicleType>('car');

  // เอามาใช้ทั้งเพิ่ม/แสดง/ลบ
  const { addVehicle, vehicles, deleteVehicle } = useTripStore();

  const canSubmit = Boolean(vehicleName.trim());

  const handleSubmit = () => {
    const newVehicle = {
      id: genId(),              // ✅ แทน Date.now().toString()
      name: vehicleName.trim(),
      type,
    } as any;
    addVehicle(newVehicle);
    // reset form
    setVehicleName('');
    setType('car');
  };

  const handleDelete = (id: string) => {
    // ถ้ามีเมธอด deleteVehicle ใน store
    if (deleteVehicle) {
      if (confirm('ลบพาหนะนี้ออกจากรายการ?')) deleteVehicle(id);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        // เคลียร์ฟอร์มเมื่อปิด
        setVehicleName('');
        setType('car');
      }}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 4,
          overflow: 'hidden',
          background: '#fff', // ให้เหมือน AddTripDialog
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
        เพิ่มพาหนะ
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
        {/* ฟอร์มเพิ่มพาหนะ */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
          <TextField
            label="ชื่อพาหนะ"
            value={vehicleName}
            onChange={(e) => setVehicleName(e.target.value)}
            fullWidth
            required
          />

          <FormControl fullWidth>
            <InputLabel>ประเภท</InputLabel>
            <Select
              value={type}
              onChange={(e) => setType(e.target.value as VehicleType)}
              label="ประเภท"
            >
              <MenuItem value="car">🚗 รถยนต์</MenuItem>
              <MenuItem value="motorcycle">🏍 รถจักรยานยนต์</MenuItem>
              <MenuItem value="other">🔧 อื่นๆ</MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Divider sx={{ my: 2 }} />

        {/* รายการพาหนะที่เคยเพิ่ม */}
        <Typography variant="subtitle1" sx={{ fontWeight: 500, mb: 1 }}>
          พาหนะที่เคยเพิ่มแล้ว
        </Typography>

        {vehicles.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            ยังไม่มีพาหนะในรายการ
          </Typography>
        ) : (
          <List
            dense
            sx={{
              pt: 0,
              mt: 0.5,
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
              '& .MuiListItem-root': {
                px: 1.25,
              },
            }}
          >
            {vehicles.map((v) => (
              <ListItem
                key={v.id}
                secondaryAction={
                  <Tooltip title="ลบพาหนะ">
                    <IconButton
                      edge="end"
                      aria-label="delete-vehicle"
                      onClick={() => handleDelete(v.id)}
                      size="small"
                      sx={{
                        color: 'error.main',
                        '&:hover': { bgcolor: 'rgba(244,67,54,0.08)' },
                      }}
                    >
                      <DeleteForeverIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                }
              >
                <DirectionsCarIcon sx={{ mr: 1, opacity: 0.8 }} fontSize="small" />
                <ListItemText
                  primary={v.name}
                  secondary={
                    v.type === 'car'
                      ? 'รถยนต์'
                      : v.type === 'motorcycle'
                      ? 'รถจักรยานยนต์'
                      : 'อื่นๆ'
                  }
                  primaryTypographyProps={{ fontWeight: 600, fontSize: 14 }}
                  secondaryTypographyProps={{ fontSize: 12, color: 'text.secondary' }}
                />
              </ListItem>
            ))}
          </List>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2, gap: 1.5 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderRadius: '50px',
            px: 3,
            textTransform: 'none',
            fontWeight: 600,
          }}
        >
          ยกเลิก
        </Button>

        <Tooltip title={!canSubmit ? 'กรอกชื่อพาหนะก่อน' : ''} disableHoverListener={canSubmit}>
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
              เพิ่มพาหนะ
            </Button>
          </span>
        </Tooltip>
      </DialogActions>
    </Dialog>
  );
}
