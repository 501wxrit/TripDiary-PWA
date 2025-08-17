'use client';
import { useState } from 'react';

export default function UseLocationButton() {
  const [msg, setMsg] = useState('');

  const handleClick = () => {
    if (!('geolocation' in navigator)) {
      setMsg('เบราว์เซอร์นี้ไม่รองรับการหาตำแหน่ง');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setMsg(`Latitude: ${latitude}, Longitude: ${longitude}`);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setMsg('คุณปฏิเสธการใช้ตำแหน่ง');
        } else {
          setMsg('ไม่สามารถดึงตำแหน่งได้');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div>
      <button onClick={handleClick}>📍 ใช้ตำแหน่งปัจจุบัน</button>
      {msg && <p>{msg}</p>}
    </div>
  );
}