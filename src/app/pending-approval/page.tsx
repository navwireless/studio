// src/app/pending-approval/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, Mail, LogOut, RefreshCw, Shield, CheckCircle2, UserCheck, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";
import { PageShell } from "@/components/layout/page-shell";
import { BRAND } from "@/styles/design-tokens";

export default function PendingApprovalPage() {
  const { user, status } = useAuth();
  const { refreshCredits, isRefreshing } = useCredits();
  const router = useRouter();
  const [lastChecked, setLastChecked] = useState<Date>(new Date());

  const checkStatus = useCallback(async () => {
    const data = await refreshCredits();
    setLastChecked(new Date());
    if (data && data.status === "approved") {
      router.push("/");
    }
  }, [refreshCredits, router]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      checkStatus();
    }, 30000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  // If already approved, redirect
  useEffect(() => {
    if (status === "approved") {
      router.push("/");
    }
  }, [status, router]);

  return (
    <PageShell maxWidth="sm" showFooter>
      <div className="flex flex-col items-center text-center py-8 md:py-16 space-y-8">
        {/* Status icon */}
        <div className="w-20 h-20 rounded-full bg-status-warning/10 border-2 border-status-warning/30 flex items-center justify-center">
          <Clock className="h-10 w-10 text-status-warning" />
        </div>

        {/* Title + description */}
        <div className="space-y-3 max-w-sm">
          <h1 className="text-2xl font-bold text-text-brand-primary">
            Account Pending Approval
          </h1>
          <p className="text-sm text-text-brand-secondary leading-relaxed">
            Your account has been created and is awaiting admin approval.
            This usually takes less than 24 hours.
          </p>
        </div>

        {/* User info */}
        <div className="w-full max-w-sm bg-surface-card rounded-xl border border-surface-border p-4 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-brand-muted flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <span className="text-text-brand-primary font-medium truncate ml-4">
              {user?.email || "—"}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-brand-muted flex items-center gap-2">
              <Shield className="h-3.5 w-3.5" />
              Status
            </span>
            <Badge
              variant="outline"
              className="bg-status-warning/10 text-status-warning border-status-warning/30 text-xs"
            >
              Pending Approval
            </Badge>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-brand-muted">Last checked</span>
            <span className="text-text-brand-disabled text-xs">
              {lastChecked.toLocaleTimeString()}
            </span>
          </div>
        </div>

        {/* What this means */}
        <div className="w-full max-w-sm bg-surface-card rounded-xl border border-surface-border p-5 text-left">
          <h3 className="text-xs font-semibold text-text-brand-secondary uppercase tracking-wider mb-3">
            What this means
          </h3>
          <ul className="space-y-2.5">
            {[
              { icon: Lock, text: "Your account is registered and secure" },
              { icon: UserCheck, text: "An administrator will review your request" },
              { icon: CheckCircle2, text: "You'll receive access once approved" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <Icon className="h-4 w-4 text-status-warning mt-0.5 flex-shrink-0" />
                <span className="text-sm text-text-brand-secondary">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Auto-refresh notice */}
        <p className="text-xs text-text-brand-disabled">
          This page auto-checks every 30 seconds. You&apos;ll be redirected once approved.
        </p>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            onClick={checkStatus}
            disabled={isRefreshing}
            className="w-full bg-status-warning hover:bg-status-warning-dark text-text-brand-inverse font-medium"
          >
            {isRefreshing ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Check Status Now
          </Button>

          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: "/auth/signin" })}
            className="w-full text-text-brand-muted hover:text-text-brand-secondary hover:bg-surface-overlay"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Support */}
        <p className="text-xs text-text-brand-disabled">
          Questions? Contact{" "}
          <a
            href={`mailto:${BRAND.adminEmail}`}
            className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
          >
            {BRAND.adminEmail}
          </a>
        </p>
      </div>
    </PageShell>
  );
}