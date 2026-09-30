import type { Metadata, Viewport } from 'next';
import './globals.css';
import CookieBanner from '@/components/CookieBanner';
import ClientProviders from '@/components/ClientProviders';

export const metadata: Metadata = {
  applicationName: 'โรงงานฝาทรงไทย ไม้สัก เมืองเพชร',
  title: 'โรงงานฝาทรงไทยเมืองเพชร | งานฝาเรือนไทย ฝาปะกน ลูกฟัก จั่วเพชรบุรี และงานสั่งทำตามแบบ',
  description: 'โรงงานฝาทรงไทยเมืองเพชร เชี่ยวชาญงานฝาเรือนไทย ฝาปะกน ลูกฟัก ลายรัดเอว โครงจั่วเพชรบุรี ปั้นหยา ประตู วงกบ และงานไม้ตามแบบ มีไม้สัก ไม้สะเดา ไม้ตะแบก หรือนำไม้มาเองได้ พร้อมช่างประกอบติดตั้ง โดยช่างเอส',
  keywords: 'โรงงานฝาทรงไทย, ฝาปะกน, ฝาลูกฟัก, ลายรัดเอว, จั่วเพชรบุรี, ปั้นหยา, ไม้สัก, ไม้สะเดา, ไม้ตะแบก, ช่างไม้เพชรบุรี, ช่างเอส',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'โรงงานฝาทรงไทย ไม้สัก เมืองเพชร',
  },
  icons: {
    icon: [
      { url: '/images/wood-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/images/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/images/wood-logo.png',
    apple: [
      { url: '/images/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: '#341F0E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className="scroll-smooth">
      <head>
        <link rel="icon" href="/images/wood-logo.png" type="image/png" />
        <link rel="apple-touch-icon" href="/images/apple-touch-icon.png" />
        <meta name="apple-mobile-web-app-title" content="โรงงานฝาทรงไทย ไม้สัก เมืองเพชร" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (window.location.pathname.startsWith('/factory-gateway')) {
                  var m = document.querySelector('link[rel="manifest"]');
                  if (m) m.href = '/manifest-admin.json';
                  var a = document.querySelector('meta[name="apple-mobile-web-app-title"]');
                  if (a) a.content = 'ระบบหลังบ้าน ฝาทรงไทย';
                  var i = document.querySelector('link[rel="apple-touch-icon"]');
                  if (i) i.href = '/images/admin-apple-touch-icon.png';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body className="antialiased bg-wood-50 text-wood-950 min-h-screen flex flex-col selection:bg-gold-500 selection:text-wood-950">
        <ClientProviders>
          {children}
          <CookieBanner />
        </ClientProviders>
      </body>
    </html>
  );
}
