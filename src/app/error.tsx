// src/app/error.tsx
"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, Home, RotateCcw } from "lucide-react";
import Image from "next/image";
import appLogo from "@/app/Favicon/apple-touch-icon.png";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error boundary caught:", error);
  }, [error]);

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

        <Card className="bg-slate-900/80 border-red-500/20 backdrop-blur-sm">
          <CardContent className="pt-8 pb-8 flex flex-col items-center text-center space-y-5">
            <div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Something went wrong
              </h2>
              <p className="text-sm text-white/50 max-w-sm">
                An unexpected error occurred. This has been noted and we&apos;re
                working on it. Please try again.
              </p>
            </div>

            {/* Show error details in development only */}
            {process.env.NODE_ENV === "development" && (
              <div className="w-full bg-red-950/50 border border-red-500/20 rounded-lg p-3 text-left">
                <p className="text-xs font-mono text-red-300 break-all">
                  {error.message}
                </p>
                {error.digest && (
                  <p className="text-xs font-mono text-red-400/60 mt-1">
                    Digest: {error.digest}
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 pt-2 w-full">
              <Button
                onClick={reset}
                variant="outline"
                className="flex-1 border-white/10 text-white hover:bg-white/5"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-teal-600 hover:bg-teal-500 text-white"
              >
                <Home className="h-4 w-4 mr-2" />
                Go Home
              </Button>
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