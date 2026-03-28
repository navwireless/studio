// src/app/rejected/page.tsx
"use client";

import React from "react";
import { signOut } from "next-auth/react";
import { XCircle, Mail, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";

export default function RejectedPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white tracking-wide">
            FindLOS
          </h1>
          <p className="text-xs text-white/40 mt-1">
            by Nav Wireless Technologies Pvt. Ltd.
          </p>
        </div>

        {/* Main Card */}
        <Card className="bg-slate-900/80 border-red-500/20 backdrop-blur-xl shadow-2xl">
          <CardContent className="pt-8 pb-8 px-6 text-center space-y-6">
            {/* Icon */}
            <div className="mx-auto w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-400" />
            </div>

            {/* Title */}
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-white">
                Account Not Approved
              </h2>
              <p className="text-sm text-white/50 leading-relaxed">
                Unfortunately, your account request was not approved. If you
                believe this is a mistake, please contact our support team.
              </p>
            </div>

            {/* User info */}
            <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/40 flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5" />
                  Email
                </span>
                <span className="text-white/80 font-medium truncate ml-4">
                  {user?.email || "—"}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="outline"
                asChild
                className="w-full border-white/10 text-white/70 hover:text-white hover:bg-white/5"
              >
                <a href="mailto:support@findlos.com">Contact Support</a>
              </Button>

              <Button
                variant="ghost"
                onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                className="w-full text-white/40 hover:text-white/70 hover:bg-white/5"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}