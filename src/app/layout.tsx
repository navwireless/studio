
import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
// AppHeader is now rendered within page.tsx or specific layouts that need it, to pass props.
// import AppHeader from '@/components/layout/app-header'; 
import Footer from '@/components/layout/footer';

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
        {/* AppHeader will be part of the children, typically in page.tsx */}
        <main className="flex-1 overflow-hidden relative flex flex-col"> {/ * Ensure main can flex its children */}
          {children}
        </main>
        <Footer />
        <Toaster />
      </body>
    </html>
  );
}
