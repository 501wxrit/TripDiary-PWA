// Server Component
import ThemeRegistry from '@/components/ThemeRegistry';
import ClientLayout from '@/components/ClientLayout';
import type { Metadata, Viewport } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trip Diary',
  description: 'บันทึกการเดินทางของคุณ',
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#1976d2',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className={geist.className}>
        <ThemeRegistry>
          <ClientLayout>{children}</ClientLayout>
        </ThemeRegistry>
      </body>
    </html>
  );
}
