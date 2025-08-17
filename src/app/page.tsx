'use client';

import React from 'react';
import { Box, Card, CardContent, CardMedia, Typography, Button, Fade, Grow } from '@mui/material';
import { useTripStore } from '@/store/tripStore';
import TripStats from '@/components/TripStats';
import AddTripDialog from '@/components/AddTripDialog';
import { useRouter } from 'next/navigation';
import PlaceIcon from '@mui/icons-material/Place';
import AddIcon from '@mui/icons-material/Add';
import { keyframes } from '@mui/system';

// Animation keyframes
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
`;

const shimmer = keyframes`
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
`;

const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const pulse = keyframes`
  0% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0.4); }
  70% { box-shadow: 0 0 0 10px rgba(25, 118, 210, 0); }
  100% { box-shadow: 0 0 0 0 rgba(25, 118, 210, 0); }
`;

export default function Home() {
  const { trips } = useTripStore();
  const router = useRouter();
  const [openAddTrip, setOpenAddTrip] = React.useState(false);

  React.useEffect(() => {
    const onOpen = () => setOpenAddTrip(true);
    document.addEventListener('openAddTripDialog', onOpen as EventListener);
    return () => document.removeEventListener('openAddTripDialog', onOpen as EventListener);
  }, []);

  return (
    <Box
      sx={{
        width: '100%',
        background: 'transparent', // ลบพื้นหลังสีม่วง
        minHeight: '100vh',
        pb: 4
      }}
    >
      {/* Hero Section with Video */}
      <Box
        sx={{
          position: 'relative',
          top: 80,
          paddingTop: '30.25%', // 16:9 aspect ratio
          width: '100%',
          height: '30vh',
          overflow: 'hidden',
          borderRadius: 5,
          mb: 10,
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(45deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
            zIndex: 1
          }
        }}
      >
        <video
          src="/VideosShow.mp4"
          autoPlay
          loop
          muted
          playsInline
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover'
          }}
        />

        {/* Hero Text Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            zIndex: 2,
            color: 'white'
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: '500',
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
              animation: `${fadeInUp} 1s ease-out`,
              mb: 2
            }}
          >
            TripDiary App
          </Typography>
          <Typography
            variant="h6"
            sx={{
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
              animation: `${fadeInUp} 1s ease-out 0.2s both`
            }}
          >
            พร้อมบันทึกความทรงจำ<br />ในทุกเส้นทางอันมีค่าของคุณ
          </Typography>
        </Box>
      </Box>

      {/* Content Container */}
      <Box sx={{ px: 0, maxWidth: '100%', mx: 0 }}>

        {/* Header Section */}
        <Fade in timeout={1000}>
          <Box sx={{ mb: 1, textAlign: 'center' }}>
            <Typography
              variant="h3"
              gutterBottom
              sx={{
                fontWeight: 'bold',
                paddingTop: 2.5,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '2px 2px 4px rgba(0,0,0,0.1)',

              }}
            >
              Your Trip Stats 💯
            </Typography>
            <Box
              sx={{
                width: '80px',
                height: '4px',
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                borderRadius: '2px',
                mx: 'auto',
                animation: `${shimmer} 2s infinite linear`,
                backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
                backgroundSize: '200% 100%'
              }}
            />
          </Box>
        </Fade>

        {/* Stats Section */}
        <Grow in timeout={1200}>
          <Box sx={{ mb: 4 }}>
            <TripStats />
          </Box>
        </Grow>

        {/* Add Trip Button */}
        <Fade in timeout={1400}>
          <Box sx={{ textAlign: 'center', mb: 4 }}>
            <Button
              variant="contained"
              size="large"
              startIcon={<AddIcon />}
              onClick={() => setOpenAddTrip(true)}
              sx={{
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                borderRadius: '50px',
                px: 4,
                py: 1.5,
                fontWeight: 'bold',
                fontSize: '1.1rem',
                textTransform: 'none',
                boxShadow: '0 8px 32px rgba(33, 150, 243, 0.4)',
                animation: `${pulse} 2s infinite`,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2 30%, #1CB5E0 90%)',
                  transform: 'translateY(-2px) scale(1.05)',
                  boxShadow: '0 12px 40px rgba(33, 150, 243, 0.6)',
                  animation: 'none'
                },
                '&:active': {
                  transform: 'translateY(0) scale(1.02)'
                }
              }}
            >
              ออกเดินทางครั้งใหม่
            </Button>
          </Box>
        </Fade>

        {/* Trips Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              lg: 'repeat(3, 1fr)',
              xl: 'repeat(4, 1fr)'
            },
            gap: { xs: 2, md: 3 },
          }}
        >
          {trips.map((trip, index) => (
            <Grow
              key={trip.id}
              in
              timeout={1000 + index * 200}
              style={{ transitionDelay: `${index * 100}ms` }}
            >
              <Card
                sx={{
                  cursor: 'pointer',
                  borderRadius: 4,
                  overflow: 'hidden',
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
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
                    transition: 'opacity 0.3s ease'
                  },
                  '&:hover': {
                    transform: 'translateY(-8px) scale(1.02)',
                    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.2)',
                    '&::before': {
                      opacity: 1
                    }
                  },
                  '&:active': {
                    transform: 'translateY(-4px) scale(1.01)'
                  }
                }}
                onClick={() => router.push(`/trips/${trip.id}`)}
              >
                {trip.coverImage && (
                  <Box sx={{ position: 'relative', overflow: 'hidden' }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={trip.coverImage}
                      alt={trip.name}
                      sx={{
                        transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  </Box>
                )}

                <CardContent sx={{ p: 3 }}>
                  <Typography
                    gutterBottom
                    variant="h6"
                    component="div"
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      fontWeight: '500',
                      color: '#2c3e50',
                      mb: 1
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
                    {trip.name}
                  </Typography>

                  {trip.province && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.9rem',
                        color: '#7f8c8d',
                        mb: 2,
                        pl: '30px',
                        fontStyle: 'italic'
                      }}
                    >
                      {"จังหวัด" + trip.province}
                    </Typography>
                  )}

                  <Box
                    sx={{
                      p: 2,
                      background: 'linear-gradient(135deg, rgba(103, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%)',
                      borderRadius: 2,
                      mb: 2
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontSize: '0.85rem',
                        color: '#34495e',
                        fontWeight: '500'
                      }}
                    >
                      {trip.startDate &&
                        new Date(trip.startDate).toLocaleDateString('th-TH', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      {trip.endDate && (
                        <>
                          {' - '}
                          {new Date(trip.endDate).toLocaleDateString('th-TH', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </>
                      )}
                    </Typography>
                  </Box>

                  {trip.description && (
                    <Typography
                      variant="body2"
                      sx={{
                        color: '#7f8c8d',
                        lineHeight: 1.6,
                        fontSize: '0.9rem'
                      }}
                    >
                      {trip.description}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            </Grow>
          ))}
        </Box>
      </Box>

      <AddTripDialog open={openAddTrip} onClose={() => setOpenAddTrip(false)} />
    </Box>
  );
}
