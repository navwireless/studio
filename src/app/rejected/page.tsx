// src/app/rejected/page.tsx
"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { XCircle, Mail, LogOut, AlertCircle, UserX, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { PageShell } from "@/components/layout/page-shell";
import { BRAND } from "@/styles/design-tokens";

export default function RejectedPage() {
  const { user } = useAuth();

  return (
    <PageShell maxWidth="sm" showFooter>
      <div className="flex flex-col items-center text-center py-8 md:py-16 space-y-8">
        {/* Status icon */}
        <div className="w-20 h-20 rounded-full bg-status-danger/10 border-2 border-status-danger/30 flex items-center justify-center">
          <XCircle className="h-10 w-10 text-status-danger" />
        </div>

        {/* Title + description */}
        <div className="space-y-3 max-w-sm">
          <h1 className="text-2xl font-bold text-text-brand-primary">
            Account Not Approved
          </h1>
          <p className="text-sm text-text-brand-secondary leading-relaxed">
            Your account registration was not approved. This may be due to
            incomplete information or organizational restrictions.
          </p>
        </div>

        {/* User info */}
        <div className="w-full max-w-sm bg-surface-card rounded-xl border border-surface-border p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-brand-muted flex items-center gap-2">
              <Mail className="h-3.5 w-3.5" />
              Email
            </span>
            <span className="text-text-brand-primary font-medium truncate ml-4">
              {user?.email || "—"}
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
              { icon: AlertCircle, text: "You cannot access the analysis tools at this time" },
              { icon: UserX, text: "You may contact the administrator for details" },
              { icon: ArrowRightLeft, text: "You can sign out and try with a different account" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-2.5">
                <Icon className="h-4 w-4 text-status-danger mt-0.5 flex-shrink-0" />
                <span className="text-sm text-text-brand-secondary">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Actions */}
        <div className="w-full max-w-sm space-y-3">
          <Button
            variant="outline"
            asChild
            className="w-full border-surface-border-light text-text-brand-secondary hover:text-text-brand-primary hover:bg-surface-overlay"
          >
            <a href={`mailto:${BRAND.adminEmail}`}>Contact Admin</a>
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
          Need help? Contact{" "}
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