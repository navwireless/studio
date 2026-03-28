// src/app/not-found.tsx
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MapPinOff, Home, ArrowLeft, Compass } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import appLogo from "@/app/Favicon/apple-touch-icon.png";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Image
            src={appLogo}
            alt="FindLOS Logo"
            width={56}
            height={56}
            className="bg-white rounded-2xl p-1.5 shadow-lg mb-4"
          />
          <h1 className="text-xl font-bold text-white tracking-wide">
            FindLOS
          </h1>
        </div>

        <Card className="bg-slate-900/80 border-white/10 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-amber-500/10 flex items-center justify-center">
              <MapPinOff className="h-8 w-8 text-amber-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-4xl font-bold text-white/20">404</h2>
              <h3 className="text-xl font-semibold text-white">
                Page Not Found
              </h3>
              <p className="text-sm text-white/50 max-w-sm">
                Looks like this path doesn&apos;t have line-of-sight to any page.
                The URL might be wrong, or the page may have moved.
              </p>
            </div>

            {/* Quick links */}
            <div className="w-full space-y-2 pt-2">
              <Link href="/" className="block">
                <Button className="w-full bg-teal-600 hover:bg-teal-500 text-white">
                  <Home className="h-4 w-4 mr-2" />
                  LOS Analyzer
                </Button>
              </Link>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-white/5"
                  >
                    <Compass className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Link href="/pricing">
                  <Button
                    variant="outline"
                    className="w-full border-white/10 text-white hover:bg-white/5"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Pricing
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-white/15 mt-6">
          © 2025 Nav Wireless Technologies Pvt. Ltd.
        </p>
      </div>
    </div>
  );
}