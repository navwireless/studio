// src/hooks/use-credits.ts
"use client";

import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

interface FreshUserData {
  credits: number;
  status: string;
  role: string;
  plan: string;
}

export function useCredits() {
  const { update } = useSession();
  const [isRefreshing, setIsRefreshing] = useState(false);

  /**
   * Fetches fresh user data from the server and triggers a session update.
   * Returns the fresh data or null on failure.
   */
  const refreshCredits = useCallback(async (): Promise<FreshUserData | null> => {
    setIsRefreshing(true);
    try {
      const res = await fetch("/api/auth/refresh", { cache: "no-store" });
      if (!res.ok) return null;

      const data: FreshUserData = await res.json();

      // Trigger NextAuth session update which re-runs the jwt callback
      await update();

      return data;
    } catch (err) {
      console.error("CREDIT_REFRESH_ERROR:", err);
      return null;
    } finally {
      setIsRefreshing(false);
    }
  }, [update]);

  return { refreshCredits, isRefreshing };
}