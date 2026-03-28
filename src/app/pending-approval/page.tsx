// src/app/pending-approval/page.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Clock, Mail, LogOut, RefreshCw, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useCredits } from "@/hooks/use-credits";

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
                <Card className="bg-slate-900/80 border-amber-500/20 backdrop-blur-xl shadow-2xl">
                    <CardContent className="pt-8 pb-8 px-6 text-center space-y-6">
                        {/* Icon */}
                        <div className="mx-auto w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                            <Clock className="h-8 w-8 text-amber-400" />
                        </div>

                        {/* Title */}
                        <div className="space-y-2">
                            <h2 className="text-xl font-semibold text-white">
                                Account Pending Approval
                            </h2>
                            <p className="text-sm text-white/50 leading-relaxed">
                                Your account has been created and is awaiting admin approval.
                                You&apos;ll be able to use FindLOS once an administrator reviews
                                your account.
                            </p>
                        </div>

                        {/* User info */}
                        <div className="bg-white/[0.03] rounded-xl border border-white/[0.06] p-4 space-y-3">
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40 flex items-center gap-2">
                                    <Mail className="h-3.5 w-3.5" />
                                    Email
                                </span>
                                <span className="text-white/80 font-medium truncate ml-4">
                                    {user?.email || "—"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40 flex items-center gap-2">
                                    <Shield className="h-3.5 w-3.5" />
                                    Status
                                </span>
                                <Badge
                                    variant="outline"
                                    className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs"
                                >
                                    Pending Approval
                                </Badge>
                            </div>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-white/40">Last checked</span>
                                <span className="text-white/50 text-xs">
                                    {lastChecked.toLocaleTimeString()}
                                </span>
                            </div>
                        </div>

                        {/* Auto-refresh notice */}
                        <p className="text-xs text-white/30">
                            This page auto-checks every 30 seconds. You&apos;ll be redirected
                            once approved.
                        </p>

                        {/* Actions */}
                        <div className="space-y-3">
                            <Button
                                onClick={checkStatus}
                                disabled={isRefreshing}
                                className="w-full bg-amber-600 hover:bg-amber-500 text-white"
                            >
                                {isRefreshing ? (
                                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <RefreshCw className="h-4 w-4 mr-2" />
                                )}
                                Check Status
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

                {/* Support note */}
                <p className="text-center text-xs text-white/30">
                    Need help? Contact us at{" "}
                    <a
                        href="mailto:support@findlos.com"
                        className="text-teal-400/60 hover:text-teal-400 underline"
                    >
                        support@findlos.com
                    </a>
                </p>
            </div>
        </div>
    );
}