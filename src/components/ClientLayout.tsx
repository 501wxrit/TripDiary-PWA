'use client';

import React from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  Toolbar,
  Typography,
  List,
  ListItemButton,
  ListItemText,
  Divider,
  GlobalStyles,
  alpha,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import { useTripStore } from '@/store/tripStore';
import AddVehicleDialog from '@/components/AddVehicleDialog';
import { useRouter } from 'next/navigation';

const drawerWidth = 280;

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const [openAddVehicle, setOpenAddVehicle] = React.useState(false);
  const { exportData, importData, clearAll } = useTripStore();
  const router = useRouter();

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      const file = e?.target?.files?.[0];
      if (file) importData(file);
    };
    input.click();
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', width: '100%', overflowX: 'hidden' }}>
      <GlobalStyles
        styles={{
          'html, body': { margin: 0, padding: 0 },
          main: { marginLeft: '0 !important', paddingLeft: '0 !important' },
          'body > div.MuiBox-root > div': { marginLeft: '0 !important' },
        }}
      />

      {/* AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          bgcolor: 'transparent',
          backgroundImage: 'none',
          borderBottom: '1px solid',
          borderColor: 'divider',
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.65), rgba(255,255,255,0.4))',
            zIndex: -1,
          },
          '@media (prefers-color-scheme: dark)': {
            '&::before': {
              background:
                'linear-gradient(180deg, rgba(17,24,39,0.5), rgba(17,24,39,0.3))',
            },
          },
        }}
      >
        <Toolbar sx={{ minHeight: 64, px: { xs: 2, sm: 3 }, gap: 1.25 }}>
  {/* Hamburger: กดแล้ว toggle เมนู */}
  <IconButton
    color="inherit"
    edge="start"
    aria-label="menu"
    onClick={() => setOpen((v) => !v)}   // <-- เปลี่ยนเป็น toggle
  >
    <MenuIcon />
  </IconButton>

  {/* โลโก้ + ชื่อ: คลิกแล้วกลับหน้าแรก + ปิดเมนู */}
  <Box
    onClick={() => {
      router.push('/');   // กลับหน้าแรก
      setOpen(false);     // เผื่อเมนูเปิดอยู่ ให้ปิดเลย
    }}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1,
      cursor: 'pointer',         // ให้รู้สึกว่าเป็นปุ่ม
      userSelect: 'none',
    }}
    role="button"
    aria-label="Go to home"
  >
    <Box
      component="img"
      src="/icon-128x128.png"
      alt="TripDiary logo"
      sx={{
        width: 36,
        height: 36,
        borderRadius: 2,
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
        objectFit: 'cover',
      }}
    />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                fontSize: 20,
                fontStyle: 'italic',
                letterSpacing: 0.2,
                lineHeight: 1,
                background: 'linear-gradient(45deg, #A0E5D9 50%, #09CDd6 90%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                userSelect: 'none',
              }}
            >
              TripDiaryApp
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          {/* ปุ่มเพิ่มรถ (แทนปุ่มเพิ่มทริปเดิม) */}
          <IconButton
            color="inherit"
            aria-label="add-vehicle"
            onClick={() => setOpenAddVehicle(true)}
            sx={{
              ml: 0.5,
              bgcolor: alpha('#2196F3', 0.15),
              '&:hover': { bgcolor: alpha('#2196F3', 0.25) },
            }}
          >
            <DirectionsCarIcon />
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* Drawer */}
      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        ModalProps={{ keepMounted: true }}
        sx={{
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            borderRight: (t) => `1px solid ${t.palette.divider}`,
            pt: '64px',
            backgroundColor: (t) => alpha(t.palette.background.paper, 0.98),
            backdropFilter: 'blur(10px)',
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <List
            sx={{
              '& .MuiListItemButton-root': {
                borderRadius: 1.5,
                px: 2,
                py: 1.25,
                mb: 0.5,
                transition: 'background-color .2s ease, transform .1s ease',
                '&:hover': { transform: 'translateY(-1px)' },
              },
              '& .MuiListItemText-primary': { fontSize: 16, fontWeight: 600 },
            }}
          >
            <ListItemButton
              onClick={() => {
                setOpen(false);
                setOpenAddVehicle(true);
              }}
            >
              <DirectionsCarIcon sx={{ mr: 1, opacity: 0.9 }} />
              <ListItemText primary="Add Vehicle" />
            </ListItemButton>

            <Divider sx={{ my: 1.25 }} />

            <ListItemButton onClick={exportData}>
              <UploadFileIcon sx={{ mr: 1, opacity: 0.9 }} />
              <ListItemText primary="Export Data" />
            </ListItemButton>

            <ListItemButton onClick={handleImportClick}>
              <DownloadIcon sx={{ mr: 1, opacity: 0.9 }} />
              <ListItemText primary="Import Data" />
            </ListItemButton>

            <ListItemButton
              onClick={() => {
                if (confirm('ล้างข้อมูลทั้งหมด?')) clearAll();
                setOpen(false);
              }}
              sx={{ color: 'error.main' }}
            >
              <DeleteForeverIcon sx={{ mr: 1 }} />
              <ListItemText primary="Clear All Data" />
            </ListItemButton>

            <Divider sx={{ my: 1.25 }} />

            <ListItemButton
              component="a"
              href="https://github.com/501wxrit"
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                justifyContent: 'center',
                color: 'text.secondary',
                fontSize: 13,
                '&:hover': {
                  color: 'primary.main',
                  backgroundColor: 'transparent',
                },
              }}
            >
              Developed by <Box component="span" sx={{ ml: 0.5, fontWeight: 600 }}>"Waritnan Palasan"</Box>
            </ListItemButton>

            <Box component="span" sx={{ fontWeight: 300 , paddingBottom: 1, fontSize: 12, color: 'text.secondary', textAlign: 'center', display: 'block' }}>
              © 2025 TripDiaryApp 
            </Box>

          </List>
        </Box>
      </Drawer>

      {/* Main */}
      <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
        <Toolbar />
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%', px: { xs: 2, sm: 3 } }}>
          {children}
        </Box>
        <Box sx={{ height: { xs: 16, sm: 24 } }} />
      </Box>

      {/* Dialog เพิ่มรถ */}
      <AddVehicleDialog open={openAddVehicle} onClose={() => setOpenAddVehicle(false)} />
    </Box>
  );
}
