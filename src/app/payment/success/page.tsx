// src/app/payment/success/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, BarChart3, Radio, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/layout/app-header";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentSuccessPage() {
    const { user } = useAuth();

    return (
        <>
            <AppHeader />
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="max-w-lg mx-auto px-4 py-16 sm:px-6 text-center">
                    <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                        <CardContent className="pt-10 pb-10 space-y-6">
                            {/* Success Icon */}
                            <div className="mx-auto w-20 h-20 rounded-full bg-emerald-500/10 border-2 border-emerald-500/20 flex items-center justify-center">
                                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Payment Successful! 🎉
                                </h1>
                                <p className="text-white/50 mt-2">
                                    Welcome to FindLOS Pro, {user?.name?.split(" ")[0] || "there"}!
                                </p>
                            </div>

                            {/* What's Unlocked */}
                            <div className="bg-white/[0.03] rounded-xl p-4 space-y-3 text-left">
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                    What&apos;s Now Unlocked
                                </p>
                                <div className="space-y-2">
                                    {[
                                        "Unlimited LOS analyses",
                                        "Bulk LOS analysis (KMZ upload)",
                                        "Priority support",
                                        "Advanced PDF reports",
                                    ].map((feature, i) => (
                                        <div key={i} className="flex items-center gap-2">
                                            <CheckCircle2 className="h-4 w-4 text-emerald-400 flex-shrink-0" />
                                            <span className="text-sm text-white/70">{feature}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-2">
                                <Button
                                    asChild
                                    className="w-full bg-teal-600 hover:bg-teal-500 text-white h-11"
                                >
                                    <Link href="/">
                                        <Radio className="h-4 w-4 mr-2" />
                                        Start Analyzing
                                        <ArrowRight className="h-4 w-4 ml-2" />
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                                >
                                    <Link href="/dashboard">
                                        <BarChart3 className="h-4 w-4 mr-2" />
                                        Go to Dashboard
                                    </Link>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </>
    );
}