'use client';

import { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  CircularProgress,
  Alert,
  Tooltip,
  Fade,
  Grow,
} from '@mui/material';
import {
  Timeline,
  TimelineItem,
  TimelineSeparator,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
} from '@mui/lab';
import { AddLocation, DirectionsCar, Delete, Edit, Home as HomeIcon } from '@mui/icons-material';
// ✅ ใช้พาธ store ให้ตรงกับที่ตั้งไว้
import { useTripStore } from '@/store/tripStore';
import AddDiaryEntryDialog from '@/components/AddDiaryEntryDialog';
import AddTripDialog from '@/components/AddTripDialog';
import { useParams, useRouter } from 'next/navigation';
import MapIcon from '@mui/icons-material/Map';
import { keyframes } from '@mui/system';
import type { Trip } from '@/types/trip';
import PlaceIcon from '@mui/icons-material/Place';

// ==== Animations ====
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;
const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;
const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
`;
const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

// ===== Helper แบบปลอดภัยกับ TS/ข้อมูลเดิม =====
const DATE_FMT: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };

function formatDate(input?: string | Date | null): string | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input as string);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString('th-TH', DATE_FMT);
}

function formatTime(input?: string | Date | number | null): string | null {
  if (!input) return null;
  const d = input instanceof Date ? input : new Date(input as any);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleTimeString('th-TH');
}

// รองรับทั้งรูปแบบ string URL และ object { url, id, ... }
function getImageUrl(img: any): string | undefined {
  if (!img) return undefined;
  if (typeof img === 'string') return img;
  if (typeof img === 'object' && img.url) return img.url as string;
  return undefined; // กรณีมีแค่ id ไม่มี url ให้ข้ามรูปนั้นไป
}

function vehicleName(v: any): string {
  if (!v) return '';
  return v.name ?? `${v.brand ?? ''} ${v.model ?? ''}`.trim();
}

export default function TripDetailPage() {
  // ✅ ให้ TS รู้ว่า id เป็น string แน่นอน
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { trips, deleteTrip, deleteDiaryEntry, loading, error } = useTripStore();
  const [openNewEntry, setOpenNewEntry] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [openEditTrip, setOpenEditTrip] = useState(false);

  const trip = trips.find((t) => t.id === id);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  if (!trip) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="warning">ไม่พบข้อมูลทริป</Alert>
      </Box>
    );
  }

  const handleDeleteTrip = () => {
    deleteTrip(trip.id);
    router.push('/');
  };

  const handleDeleteEntry = (entryId: string) => {
    deleteDiaryEntry(trip.id, entryId);
    setDeletingEntryId(null);
  };

  const startStr = formatDate((trip as any).startDate);
  const endStr = formatDate((trip as any).endDate);

  return (
    <Box
      sx={{
        width: '100%',
        background: 'transparent',
        minHeight: '100vh',
        pb: 4,
      }}
    >
      {/* Hero */}
      <Box
        sx={{
          position: 'relative',
          top: 80,
          paddingTop: '30.25%', // 16:9
          width: '100%',
          height: '30vh',
          overflow: 'hidden',
          borderRadius: 5,
          mb: 10,
          '&::before': {
            content: '""',
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.15) 100%)',
            zIndex: 1,
          },
        }}
      >
        {(trip as any).coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={(trip as any).coverImage}
            alt={trip.name}
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              filter: 'saturate(1.05)',
            }}
          />
        ) : (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(135deg, rgba(103,126,234,0.6) 0%, rgba(118,75,162,0.6) 100%)',
            }}
          />
        )}

        {/* Action Buttons – Edit / Delete */}
        <Box
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            zIndex: 3,
            display: 'flex',
            gap: 1,
            '& .MuiIconButton-root': {
              backdropFilter: 'blur(10px)',
              backgroundColor: 'rgba(255,255,255,0.65)',
              border: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 6px 18px rgba(0,0,0,0.12)',
              transition: 'transform .2s ease, box-shadow .25s ease',
            },
            '& .MuiIconButton-root:hover': {
              transform: 'translateY(-2px)',
              boxShadow: '0 12px 28px rgba(0,0,0,0.18)',
            },
          }}
        >
          <Tooltip title="แก้ไขทริป" arrow>
            <IconButton
              aria-label="edit-trip"
              onClick={() => setOpenEditTrip(true)}
              size="small"
              sx={{ width: 40, height: 40 }}
            >
              <Edit fontSize="small" />
            </IconButton>
          </Tooltip>

          <Tooltip title="ลบทริป" arrow>
            <IconButton
              aria-label="delete-trip"
              color="error"
              onClick={() => setOpenDeleteDialog(true)}
              size="small"
              sx={{ width: 40, height: 40 }}
            >
              <Delete fontSize="small" />
            </IconButton>
          </Tooltip>
        </Box>

        {/* Text Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 2,
            color: 'white',
            px: 2,
          }}
        >
          <Typography
            variant="h3"
            sx={{
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              animation: `${fadeInUp} 0.9s ease-out`,
              mb: 0.5,
            }}
          >
            {trip.name}
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.95,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              animation: `${fadeInUp} 0.9s ease-out 0.15s both`,
            }}
          >
            จังหวัด{(trip as any).province ?? ''}
          </Typography>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ px: 0, maxWidth: '100%', mx: 0 }}>
        <Fade in timeout={800}>
          <Box sx={{ mb: 0.1, textAlign: 'center' }}>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                paddingTop: 2,
                fontWeight: '500',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
              }}
            >
              รายละเอียดทริป
            </Typography>
            <Box
              sx={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                borderRadius: '2px',
                mx: 'auto',
                animation: `${shimmer} 2s infinite linear`,
                backgroundImage:
                  'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                backgroundSize: '200% 100%',
              }}
            />
          </Box>
        </Fade>

        {/* Summary card */}
        <Grow in timeout={900}>
          <Card
            sx={{
              mb: 3,
              mx: { xs: 2, md: 'auto' },
              maxWidth: 1200,
              borderRadius: 4,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
            }}
          >
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
                {/* ซ้าย */}
                <Box sx={{ flex: 1, minWidth: 260 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <DirectionsCar sx={{ mr: 1 }} />
                    <Typography variant="h6">{vehicleName(trip.vehicle)}</Typography>
                  </Box>

                  <Typography color="text.secondary" sx={{ mb: 1 }}>
                    {startStr}
                    {endStr && (
                      <>
                        {' - '}
                        {endStr}
                      </>
                    )}
                  </Typography>

                  {(trip as any).description && (
                    <Typography sx={{ color: '#34495e' }}>
                      {(trip as any).description}
                    </Typography>
                  )}
                </Box>

                {/* ขวา */}
                {(trip as any).coverImage && (
                  <CardMedia
                    component="img"
                    image={(trip as any).coverImage}
                    alt={trip.name}
                    sx={{
                      width: 180,
                      maxWidth: 220,
                      height: 'auto',
                      maxHeight: 160,
                      objectFit: 'cover',
                      borderRadius: 2,
                      ml: 'auto',
                    }}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grow>

        {/* ปุ่มเพิ่มจุดแวะ */}
        <Fade in timeout={1000}>
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Button
              variant="contained"
              startIcon={<AddLocation />}
              onClick={() => setOpenNewEntry(true)}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1.05rem',
                textTransform: 'none',
                boxShadow: '0 8px 32px rgba(33, 150, 243, 0.35)',
                animation: `${pulse} 2s infinite`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  transform: 'translateY(-2px) scale(1.04)',
                  boxShadow: '0 12px 40px rgba(33, 150, 243, 0.55)',
                  animation: 'none',
                },
                '&:active': { transform: 'translateY(0) scale(1.02)' },
              }}
            >
              เพิ่มจุดแวะ
            </Button>
          </Box>
        </Fade>

        {/* Timeline entries */}
        <Box sx={{ mx: { xs: 2, md: 'auto' }, maxWidth: 900 }}>
          <Timeline>
            {trip.entries.map((entry: any, index: number) => {
              // ✅ รองรับทั้ง schema เก่าและใหม่
              const firstImgUrl = getImageUrl(entry?.images?.[0]);
              const locName = entry?.location?.name ?? entry?.locationName ?? 'จุดแวะ';
              const lat = entry?.location?.lat ?? entry?.lat;
              const lng = entry?.location?.lng ?? entry?.lng;
              const timeStr = formatTime(entry?.timestamp ?? entry?.createdAt);
              const desc = entry?.description ?? entry?.text;


              return (
    <TimelineItem key={entry.id} sx={{ '&::before': { display: 'none' } }}>
      <TimelineSeparator>
        <TimelineDot />
        {index < trip.entries.length - 1 && <TimelineConnector />}
      </TimelineSeparator>
      <TimelineContent sx={{ px: 0, py: 0 }}>
        <Grow in timeout={800}>
          <Card
            sx={{
              width: '100%',
              boxShadow: 2,
              borderRadius: 3,
              mb: 2.5,
              overflow: 'hidden',
              background: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(18px)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              position: 'relative',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '4px',
                background: 'linear-gradient(90deg, #667eea, #764ba2, #667eea)',
                backgroundSize: '200% 100%',
                animation: `${shimmer} 3s infinite linear`,
                opacity: 0,
                transition: 'opacity 0.3s ease',
              },
              '&:hover::before': { opacity: 1 },
            }}
          >
            {firstImgUrl && (
              <CardMedia
                component="img"
                height="180"
                image={firstImgUrl}
                alt={locName}
                sx={{ objectFit: 'cover' }}
              />
            )}

            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                  <Typography
  gutterBottom
  variant="h6"
  component="div"
  sx={{
    display: 'flex',
    alignItems: 'center',
    fontWeight: 500,
    color: '#2c3e50',
    mb: 0.5
  }}
>
  <PlaceIcon
    sx={{
      fontSize: 22,
      color: '#e74c3c',
      mr: 1,
      animation: `${float} 3s ease-in-out infinite`
    }}
  />
  {locName}
</Typography>


                  {/* พิกัด + ปุ่ม Maps */}
                  {lat != null && lng != null && !isNaN(Number(lat)) && !isNaN(Number(lng)) && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: -0.5, mb: 0.5 }}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: '0.95rem', opacity: 0.75 }}
                      >
                        ({Number(lat).toFixed(5)}, {Number(lng).toFixed(5)})
                      </Typography>
                      <IconButton
                        size="small"
                        color="primary"
                        component="a"
                        href={`https://www.google.com/maps?q=${lat},${lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        sx={{ ml: 0.5 }}
                      >
                        <MapIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}

                  {timeStr && (
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem', opacity: 0.75 }}>
                      {timeStr}
                    </Typography>
                  )}

                  {desc && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {': ' + desc}
                    </Typography>
                  )}

                  {/* รูปถัด ๆ ไป */}
                  {Array.isArray(entry?.images) && entry.images.length > 1 && (
                    <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {entry.images.slice(1).map((image: any, i: number) => {
                        const url = getImageUrl(image);
                        if (!url) return null;
                        return (
                          <CardMedia
                            key={i}
                            component="img"
                            image={url}
                            alt={`Image ${i + 2}`}
                            sx={{
                              width: 96,
                              height: 64,
                              objectFit: 'cover',
                              borderRadius: 1,
                              boxShadow: 1,
                            }}
                          />
                        );
                      })}
                    </Box>
                  )}
                </Box>

                <IconButton
                  size="small"
                  color="error"
                  onClick={() => setDeletingEntryId(entry.id)}
                  sx={{ ml: 1 }}
                >
                  <Delete />
                </IconButton>
              </Box>
            </CardContent>
          </Card>
        </Grow>
      </TimelineContent>
    </TimelineItem>
  );
})}

          </Timeline>
        </Box>
      </Box>

      {/* ปุ่ม Home กลางล่าง */}
      <Tooltip title="กลับหน้าแรก" arrow>
        <IconButton
          aria-label="home"
          onClick={() => router.push('/')}
          sx={(theme) => ({
            width: 50,
            height: 50,
            position: 'fixed',
            bottom: 20,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: theme.zIndex.appBar + 1,
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'divider',
            boxShadow: 2,
            '&:hover': { bgcolor: 'action.hover' },
          })}
        >
          <HomeIcon />
        </IconButton>
      </Tooltip>

      {/* Dialogs */}
      <AddTripDialog
        open={openEditTrip}
        onClose={() => setOpenEditTrip(false)}
        trip={trip as Trip}
        onSave={(patch: Partial<Trip>) => {
          const { updateTrip } = useTripStore.getState() as {
            updateTrip: (id: string, patch: Partial<Trip>) => void;
          };
          if (updateTrip) updateTrip(trip.id, patch);
          setOpenEditTrip(false);
        }}
      />

      <AddDiaryEntryDialog
        open={openNewEntry}
        onClose={() => setOpenNewEntry(false)}
        tripId={trip.id}
      />

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>ยืนยันการลบทริป</DialogTitle>
        <DialogContent>
          <Typography>
            คุณต้องการลบทริป "{trip.name}" และข้อมูลทั้งหมดที่เกี่ยวข้องใช่หรือไม่?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>ยกเลิก</Button>
          <Button onClick={handleDeleteTrip} color="error">
            ลบทริป
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deletingEntryId)} onClose={() => setDeletingEntryId(null)}>
        <DialogTitle>ยืนยันการลบบันทึก</DialogTitle>
        <DialogContent>
          <Typography>คุณต้องการลบบันทึกนี้ใช่หรือไม่?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingEntryId(null)}>ยกเลิก</Button>
          <Button
            onClick={() => deletingEntryId && handleDeleteEntry(deletingEntryId)}
            color="error"
          >
            ลบบันทึก
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
