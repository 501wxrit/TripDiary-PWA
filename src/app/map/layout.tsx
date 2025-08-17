'use client';

export default function MapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={{ 
      position: 'fixed',
      top: 64,
      left: 0,
      right: 0,
      bottom: 64,
      zIndex: 0
    }}>
      {children}
    </div>
  );
}
