'use client';

import React from 'react';
import { AppBar, Box, Drawer, IconButton, Toolbar, Typography, Button, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useTripStore } from '@/store/tripStore';

const drawerWidth = 240;

export default function Layout({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const { exportData, importData, clearAll } = useTripStore();

  const handleImportClick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e: any) => {
      if (e.target.files?.[0]) {
        importData(e.target.files[0]);
      }
    };
    input.click();
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" onClick={() => setOpen(!open)}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            TripDiary
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="persistent"
        anchor="left"
        open={open}
        sx={{
          width: drawerWidth,
          '& .MuiDrawer-paper': { width: drawerWidth, boxSizing: 'border-box' }
        }}
      >
        <Toolbar />
        <Box sx={{ p: 2 }}>
          <Button variant="contained" fullWidth onClick={exportData} sx={{ mb: 1 }}>
            Export Data
          </Button>
          <Button variant="contained" fullWidth onClick={handleImportClick} sx={{ mb: 1 }}>
            Import Data
          </Button>
          <Divider sx={{ my: 1 }} />
          <Button variant="outlined" color="error" fullWidth onClick={clearAll}>
            Clear All Data
          </Button>
        </Box>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
