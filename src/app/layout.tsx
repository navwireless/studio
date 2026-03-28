// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { GoogleMapsLoaderProvider } from "@/components/GoogleMapsLoaderProvider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { CookieConsent } from "@/components/cookie-consent";
import { checkEnvOnStartup } from "@/lib/env";

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
    "Professional LOS feasibility analysis platform for telecom professionals. Analyze terrain elevation profiles, Fresnel zone clearance, and tower heights for FSO/microwave links.",
  keywords: [
    "LOS analysis",
    "line of sight",
    "telecom",
    "FSO",
    "microwave link",
    "terrain analysis",
    "Fresnel zone",
    "tower height",
    "LiFi",
    "wireless link planning",
  ],
  authors: [{ name: "Nav Wireless Technologies Pvt. Ltd." }],
  creator: "Raj Patel",
  publisher: "Nav Wireless Technologies Pvt. Ltd.",
  openGraph: {
    title: "FindLOS — Line-of-Sight Feasibility Analysis",
    description:
      "Professional LOS feasibility analysis for telecom professionals.",
    url: "https://findlos.com",
    siteName: "FindLOS",
    type: "website",
    locale: "en_IN",
  },
  twitter: {
    card: "summary_large_image",
    title: "FindLOS — LOS Feasibility Analysis",
    description: "Analyze line-of-sight feasibility for telecom links.",
  },
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://findlos.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
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
        <AuthProvider>
          <GoogleMapsLoaderProvider>
            <main className="flex-1 overflow-hidden relative flex flex-col">
              {children}
            </main>
            <Toaster />
            <CookieConsent />
          </GoogleMapsLoaderProvider>
        </AuthProvider>
      </body>
    </html>
  );
}