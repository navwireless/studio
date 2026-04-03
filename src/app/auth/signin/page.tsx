// src/app/auth/signin/page.tsx
"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/layout/app-header";
import { AppFooter } from "@/components/layout/app-footer";
import { FindLOSLogo } from "@/components/ui/findlos-logo";
import { BRAND } from "@/styles/design-tokens";

function GoogleIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

const FEATURES = [
  "Terrain elevation analysis with Google APIs",
  "Fresnel zone & clearance checking",
  "Device compatibility assessment",
  "Professional PDF reports",
  "Fiber path estimation",
  "10 free credits to start",
] as const;

function SignInContent() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/";
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl });
    } catch {
      setIsLoading(false);
    }
  };

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex flex-col h-dvh overflow-hidden">
        <AppHeader />
        <div className="flex-1 flex items-center justify-center bg-surface-base">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
            <p className="text-sm text-text-brand-muted">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-dvh overflow-hidden">
      <AppHeader />

      <div className="flex-1 overflow-y-auto bg-surface-base">
        {/* Main content: split layout on desktop, stacked on mobile */}
        <div className="min-h-full flex flex-col lg:flex-row">
          {/* ── Left: Sign-in form ── */}
          <div className="flex-1 flex items-center justify-center px-6 py-12 lg:py-0">
            <div className="w-full max-w-md space-y-8">
              {/* Logo + tagline */}
              <div className="space-y-3">
                <FindLOSLogo variant="full" size="lg" />
                <div className="space-y-1">
                  <h1 className="text-2xl font-bold text-text-brand-primary">
                    {BRAND.tagline}
                  </h1>
                  <p className="text-sm text-text-brand-muted leading-relaxed">
                    {BRAND.description} for FSO and microwave link deployments.
                  </p>
                </div>
              </div>

              {/* Error message */}
              {error && (
                <div className="bg-status-danger/10 border border-status-danger/30 rounded-lg p-3">
                  <p className="text-sm text-status-danger">
                    {error === "OAuthSignin" &&
                      "Could not start Google sign-in. Please try again."}
                    {error === "OAuthCallback" &&
                      "Error during authentication. Please try again."}
                    {error === "AccessDenied" &&
                      "Your account has been suspended or rejected. Contact support."}
                    {error === "Callback" &&
                      "Sign-in failed. Please try again."}
                    {!["OAuthSignin", "OAuthCallback", "AccessDenied", "Callback"].includes(error) &&
                      "An unexpected error occurred. Please try again."}
                  </p>
                </div>
              )}

              {/* Google sign-in button */}
              <Button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full h-12 bg-white hover:bg-gray-50 text-gray-800 font-medium text-sm border border-gray-200 rounded-lg shadow-sm transition-all"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400 mr-3" />
                ) : (
                  <GoogleIcon />
                )}
                <span className="ml-3">
                  {isLoading ? "Signing in..." : "Sign in with Google"}
                </span>
              </Button>

              {/* Terms notice */}
              <p className="text-xs text-text-brand-muted leading-relaxed">
                By signing in, you agree to our{" "}
                <Link
                  href="/terms"
                  className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
                >
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link
                  href="/privacy"
                  className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              {/* Feature list */}
              <div className="pt-4 border-t border-surface-border">
                <p className="text-xs font-semibold text-text-brand-secondary uppercase tracking-wider mb-3">
                  What you get
                </p>
                <ul className="space-y-2.5">
                  {FEATURES.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <div className="mt-0.5 h-4 w-4 rounded-full bg-status-success/15 flex items-center justify-center flex-shrink-0">
                        <Check className="h-2.5 w-2.5 text-status-success" />
                      </div>
                      <span className="text-sm text-text-brand-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* ── Right: Decorative background (desktop only) ── */}
          <div className="hidden lg:flex flex-1 items-center justify-center relative overflow-hidden bg-surface-card">
            {/* CSS-only abstract terrain/grid decoration */}
            <div className="absolute inset-0">
              {/* Gradient base */}
              <div className="absolute inset-0 bg-gradient-to-br from-brand-900/40 via-surface-card to-brand-800/20" />

              {/* Grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.06]"
                style={{
                  backgroundImage: `
                    linear-gradient(rgba(0, 102, 255, 0.3) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(0, 102, 255, 0.3) 1px, transparent 1px)
                  `,
                  backgroundSize: '60px 60px',
                }}
              />

              {/* Diagonal LOS line decoration */}
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 800 800"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Terrain-like wavy path */}
                <path
                  d="M0 600 Q100 550 200 580 Q300 610 400 560 Q500 510 600 540 Q700 570 800 520"
                  stroke="rgba(0, 102, 255, 0.12)"
                  strokeWidth="2"
                  fill="none"
                />
                <path
                  d="M0 650 Q150 600 300 640 Q450 680 600 620 Q750 560 800 580"
                  stroke="rgba(0, 102, 255, 0.08)"
                  strokeWidth="2"
                  fill="none"
                />

                {/* LOS line */}
                <line
                  x1="150" y1="450" x2="650" y2="350"
                  stroke="rgba(0, 102, 255, 0.25)"
                  strokeWidth="2"
                  strokeDasharray="8 4"
                />

                {/* Site markers */}
                <circle cx="150" cy="450" r="8" fill="rgba(0, 102, 255, 0.3)" />
                <circle cx="150" cy="450" r="4" fill="rgba(0, 102, 255, 0.6)" />
                <circle cx="650" cy="350" r="8" fill="rgba(0, 102, 255, 0.3)" />
                <circle cx="650" cy="350" r="4" fill="rgba(0, 102, 255, 0.6)" />

                {/* Tower lines */}
                <line x1="150" y1="450" x2="150" y2="500" stroke="rgba(0, 102, 255, 0.15)" strokeWidth="2" />
                <line x1="650" y1="350" x2="650" y2="400" stroke="rgba(0, 102, 255, 0.15)" strokeWidth="2" />
              </svg>

              {/* Radial glow */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-brand-500/5 blur-[100px]" />
            </div>

            {/* Centered brand text */}
            <div className="relative z-10 text-center space-y-4 px-12">
              <FindLOSLogo variant="icon" size="lg" className="mx-auto" />
              <h2 className="text-3xl font-bold text-text-brand-primary">
                Professional Link Planning
              </h2>
              <p className="text-sm text-text-brand-muted max-w-xs mx-auto leading-relaxed">
                Trusted by telecom engineers for line-of-sight feasibility analysis and terrain assessment.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <AppFooter />
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col h-dvh overflow-hidden">
          <div className="h-header bg-surface-card border-b border-surface-border" />
          <div className="flex-1 flex items-center justify-center bg-surface-base">
            <Loader2 className="h-8 w-8 animate-spin text-brand-500" />
          </div>
        </div>
      }
    >
      <SignInContent />
    </Suspense>
  );
}