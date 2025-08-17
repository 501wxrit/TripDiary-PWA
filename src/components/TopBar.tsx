'use client';

import * as React from 'react';
import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Typography,
  Button,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import MapIcon from '@mui/icons-material/Map';

export default function TopBar() {
  const openAddTrip = () => {
    document.dispatchEvent(new Event('openAddTripDialog'));
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        top: 0,
        left: 0,
        right: 0,
        bgcolor: 'transparent',
        backgroundImage: 'none',
        borderBottom: '1px solid',
        borderColor: 'divider',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.75), rgba(255,255,255,0.55))',
          zIndex: -1,
        },
        '@media (prefers-color-scheme: dark)': {
          '&::before': {
            background:
              'linear-gradient(180deg, rgba(17,24,39,0.65), rgba(17,24,39,0.45))',
          },
        },
      }}
    >
      <Toolbar sx={{ minHeight: 64, px: { xs: 2, md: 3 } }}>
        {/* Left: Logo + App name */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            cursor: 'default',
            userSelect: 'none',
          }}
        >
          {/* เปลี่ยนเป็น <img src="/icons/logo.svg" ...> ได้ ถ้ามีไฟล์โลโก้จริง */}
          <Box
            sx={{
              width: 28,
              height: 28,
              display: 'grid',
              placeItems: 'center',
              borderRadius: '10px',
              background:
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
            }}
          >
            <MapIcon sx={{ fontSize: 18, color: 'white' }} />
          </Box>

          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              letterSpacing: 0.2,
              lineHeight: 1,
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            TripDiary
          </Typography>
        </Box>

        {/* Spacer */}
        <Box sx={{ flex: 1 }} />

        {/* Right: single action button */}
        <Button
          onClick={openAddTrip}
          startIcon={<AddIcon />}
          variant="contained"
          sx={{
            borderRadius: '999px',
            px: 2.2,
            py: 0.8,
            fontWeight: 700,
            textTransform: 'none',
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 8px 24px rgba(33,150,243,0.35)',
            '&:hover': {
              background:
                'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
            },
          }}
          aria-label="เพิ่มทริป"
        >
          เพิ่มทริป
        </Button>
      </Toolbar>

      {/* subtle highlight underline */}
      <Box
        sx={{
          height: 2,
          mx: 2,
          borderRadius: 2,
          opacity: 0.5,
          background:
            'linear-gradient(90deg, rgba(255,255,255,0), rgba(255,255,255,0.8), rgba(255,255,255,0))',
          '@media (prefers-color-scheme: dark)': {
            background:
              'linear-gradient(90deg, rgba(0,0,0,0), rgba(255,255,255,0.25), rgba(0,0,0,0))',
          },
        }}
      />
    </AppBar>
  );
}
