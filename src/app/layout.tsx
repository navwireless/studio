// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GoogleMapsLoaderProvider } from "@/components/GoogleMapsLoaderProvider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { checkEnvOnStartup } from "@/lib/env";
import { GlobalHelpProvider } from "@/components/help/global-help-provider";

// Validate environment variables on server startup
checkEnvOnStartup();

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "FindLOS — Line-of-Sight Feasibility Analysis",
    template: "%s | FindLOS",
  },
  description:
    "Professional terrain analysis and FSO link planning by Nav Wireless Technologies. Analyze elevation profiles, Fresnel zone clearance, and tower heights for free-space optical and microwave links.",
  keywords: [
    "LOS analysis",
    "line of sight",
    "telecom",
    "FSO",
    "free space optical",
    "microwave link",
    "terrain analysis",
    "Fresnel zone",
    "tower height",
    "LiFi",
    "wireless link planning",
    "FindLOS",
    "Nav Wireless",
  ],
  authors: [{ name: "Nav Wireless Technologies Pvt. Ltd." }],
  creator: "Raj Patel",
  publisher: "Nav Wireless Technologies Pvt. Ltd.",
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/Favicon/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/Favicon/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: '/Favicon/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  openGraph: {
    title: "FindLOS — Line-of-Sight Feasibility Analysis",
    description:
      "Professional terrain analysis and FSO link planning platform by Nav Wireless Technologies.",
    url: "https://findlos.com",
    siteName: "FindLOS",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "FindLOS — LOS Feasibility Analysis",
    description: "Professional terrain analysis and FSO link planning.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://findlos.com"),
  other: {
    'theme-color': '#0A0F18',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: '#0A0F18',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={[
          geistSans.variable,
          geistMono.variable,
          'font-sans antialiased bg-background text-foreground flex flex-col h-dvh overflow-hidden',
        ].join(' ')}
        suppressHydrationWarning
      >
        <AuthProvider>
          <GoogleMapsLoaderProvider>
            <main className="flex-1 overflow-hidden relative flex flex-col">
              {children}
            </main>
            <GlobalHelpProvider />
            <Toaster />
            <CookieConsent />
          </GoogleMapsLoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}