// src/app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { FindLOSLogo } from "@/components/ui/findlos-logo";
import { BRAND } from "@/styles/design-tokens";

const ERROR_MESSAGES: Record<string, string> = {
  Configuration:
    "There is a problem with the server configuration. Please contact support.",
  AccessDenied:
    "Your account access has been denied. This may mean your account is suspended or rejected. Please contact support.",
  Verification:
    "The verification link has expired or has already been used.",
  OAuthSignin:
    "Could not initiate Google sign-in. Please check your internet connection and try again.",
  OAuthCallback:
    "There was an error during the authentication process. Please try again.",
  OAuthCreateAccount:
    "Could not create your account. Please try again or contact support.",
  EmailCreateAccount:
    "Could not create your account with this email. Please try again.",
  Callback:
    "An error occurred during sign-in. Please try again.",
  OAuthAccountNotLinked:
    "This email is already associated with another sign-in method.",
  SessionRequired:
    "You need to be signed in to access this page.",
  Default:
    "An unexpected authentication error occurred. Please try again.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error") || "Default";
  const errorMessage =
    ERROR_MESSAGES[errorCode] || ERROR_MESSAGES["Default"];

  return (
    <PageShell maxWidth="sm" showFooter>
      <div className="flex flex-col items-center text-center py-8 md:py-16 space-y-8">
        {/* Logo */}
        <FindLOSLogo variant="icon" size="lg" />

        {/* Error icon */}
        <div className="w-16 h-16 rounded-full bg-status-warning/10 border-2 border-status-warning/30 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-status-warning" />
        </div>

        {/* Title + message */}
        <div className="space-y-3 max-w-sm">
          <h1 className="text-2xl font-bold text-text-brand-primary">
            Authentication Error
          </h1>
          <p className="text-sm text-text-brand-secondary leading-relaxed">
            {errorMessage}
          </p>
          {errorCode !== "Default" && (
            <p className="text-xs text-text-brand-disabled">
              Error code: {errorCode}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            asChild
            className="w-full bg-brand-500 hover:bg-brand-600 text-white font-medium"
          >
            <Link href="/auth/signin">Try Again</Link>
          </Button>

          <Button
            variant="ghost"
            asChild
            className="w-full text-text-brand-muted hover:text-text-brand-secondary hover:bg-surface-overlay"
          >
            <Link href="/">Go to Homepage</Link>
          </Button>
        </div>

        {/* Support */}
        <p className="text-xs text-text-brand-disabled">
          If this problem persists, contact{" "}
          <a
            href={`mailto:${BRAND.supportEmail}`}
            className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
          >
            {BRAND.supportEmail}
          </a>
        </p>
      </div>
    </PageShell>
  );
}

export default function AuthErrorPage() {
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
      <ErrorContent />
    </Suspense>
  );
}