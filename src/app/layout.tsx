import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { GoogleMapsLoaderProvider } from '@/components/GoogleMapsLoaderProvider';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'LiFi Feasibility Checker',
  description: 'Line-of-Sight Analyzer for LiFi links by Nav Wireless Technologies Pvt. Ltd.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased 
                   bg-background text-foreground 
                   flex flex-col h-dvh overflow-hidden`}
      >
        <GoogleMapsLoaderProvider>
          <main className="flex-1 overflow-hidden relative flex flex-col">
            {children}
          </main>
          <Toaster />
        </GoogleMapsLoaderProvider>
      </body>
    </html>
  );
}