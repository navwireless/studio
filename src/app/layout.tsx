
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import AppHeader from '@/components/layout/app-header'; // Keep AppHeader

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
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground flex flex-col h-screen overflow-hidden`}>
        <AppHeader />
        {/* Main content area will be managed by page.tsx for the new grid */}
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}
