import type { Metadata, Viewport } from 'next';
import './globals.css';
import { config } from '@/lib/config';
import { TopNav } from '@/components/shell/TopNav';
import { BottomNav } from '@/components/shell/BottomNav';
import { Footer } from '@/components/shell/Footer';
import { RainingObjects } from '@/components/theme/RainingObjects';
import { RotatingBackground } from '@/components/theme/RotatingBackground';
import { PwaRegister } from '@/components/shell/PwaRegister';

export const metadata: Metadata = {
  title: {
    default: `${config.appName} — SoCal rentals, cars & work vehicles`,
    template: `%s · ${config.shortName}`,
  },
  description: config.tagline,
  manifest: '/manifest.json',
  applicationName: config.appName,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: config.shortName,
  },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website',
    title: config.appName,
    description: config.tagline,
    siteName: config.appName,
  },
  twitter: { card: 'summary_large_image', title: config.appName, description: config.tagline },
  icons: { icon: '/icons/favicon.svg', apple: '/icons/apple-touch.png' },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#34db00',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full">
      <body className="relative min-h-dvh bg-frosting-50 text-chocolate-800 antialiased">
        <RotatingBackground />
        <RainingObjects count={20} />
        <TopNav />
        <main className="relative z-10 mx-auto max-w-7xl px-4 pb-12">
          {children}
        </main>
        <Footer />
        <BottomNav />
        <PwaRegister />
        <script
          // Inline reduce-motion bootstrap so we don't flash motion before hydration.
          dangerouslySetInnerHTML={{
            __html: `try{var u=localStorage.getItem('lmgl:reduce-motion')==='1';if(u)document.documentElement.classList.add('reduce-motion');}catch(e){}`,
          }}
        />
      </body>
    </html>
  );
}
