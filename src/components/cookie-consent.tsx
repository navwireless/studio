// src/components/cookie-consent.tsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Cookie, X } from "lucide-react";
import { cn } from "@/lib/utils";

const COOKIE_CONSENT_KEY = "findlos_cookie_consent";

type ConsentValue = "all" | "necessary" | null;

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const stored = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (stored === "all" || stored === "necessary") {
        setConsent(stored);
      } else {
        // Show banner after a short delay for smoother UX
        const timer = setTimeout(() => {
          setIsVisible(true);
        }, 1500);
        return () => clearTimeout(timer);
      }
    } catch {
      // localStorage unavailable
    }
  }, []);

  const handleAccept = (value: "all" | "necessary") => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, value);
    } catch {
      // localStorage unavailable
    }
    setConsent(value);
    setIsVisible(false);
  };

  const handleDismiss = () => {
    setIsVisible(false);
    // Will show again on next visit since we didn't store a preference
  };

  // Don't render during SSR or if already consented
  if (!isMounted || consent !== null || !isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-[100] p-4 sm:p-6",
        "transition-all duration-500 ease-out",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-full opacity-0"
      )}
    >
      <div className="max-w-2xl mx-auto">
        <div className="bg-slate-900/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 sm:p-5">
          <div className="flex items-start gap-3">
            {/* Icon */}
            <div className="hidden sm:flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-500/10">
              <Cookie className="h-4 w-4 text-teal-400" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white/80 leading-relaxed">
                FindLOS uses cookies for authentication and to improve your
                experience. We use essential session cookies for sign-in and
                local storage for your preferences.{" "}
                <Link
                  href="/privacy"
                  className="text-teal-400 hover:text-teal-300 underline underline-offset-2"
                >
                  Learn more
                </Link>
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Button
                  onClick={() => handleAccept("all")}
                  size="sm"
                  className="bg-teal-600 hover:bg-teal-500 text-white font-medium text-xs h-8 px-4"
                >
                  Accept All
                </Button>
                <Button
                  onClick={() => handleAccept("necessary")}
                  size="sm"
                  variant="outline"
                  className="border-white/10 text-white/70 hover:bg-white/5 font-medium text-xs h-8 px-4"
                >
                  Necessary Only
                </Button>
              </div>
            </div>

            {/* Close */}
            <button
              onClick={handleDismiss}
              className="shrink-0 p-1 rounded-md text-white/30 hover:text-white/60 hover:bg-white/5 transition-colors"
              aria-label="Dismiss cookie banner"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}