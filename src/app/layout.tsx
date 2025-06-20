
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import Footer from '@/components/layout/footer';
import { GoogleMapsLoaderProvider } from '@/components/GoogleMapsLoaderProvider'; // Import the provider
import { NotificationsProvider } from '@/context/NotificationContext'; // Import NotificationsProvider

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
                   flex flex-col h-screen overflow-hidden`}
      >
        <NotificationsProvider> {/* Wrap here */}
          <GoogleMapsLoaderProvider>
            <main className="flex-1 overflow-hidden relative flex flex-col">
              {children}
            </main>
            <Footer />
            <Toaster /> {/* Toaster can remain outside or inside, usually fine outside */}
          </GoogleMapsLoaderProvider>
        </NotificationsProvider>
      </body>
    </html>
  );
}
