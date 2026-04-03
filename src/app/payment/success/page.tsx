// src/app/payment/success/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { CheckCircle2, BarChart3, Radio, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { useAuth } from "@/hooks/use-auth";

export default function PaymentSuccessPage() {
    const { user } = useAuth();

    return (
        <PageShell
            breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Payment" },
            ]}
            maxWidth="sm"
        >
            <div className="py-8 text-center">
                <Card className="bg-surface-card border-surface-border">
                    <CardContent className="pt-10 pb-10 space-y-6">
                        <div className="mx-auto w-20 h-20 rounded-full bg-status-success/10 border-2 border-status-success/20 flex items-center justify-center">
                            <CheckCircle2 className="h-10 w-10 text-status-success" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-text-brand-primary">
                                Payment Successful! 🎉
                            </h1>
                            <p className="text-text-brand-muted mt-2">
                                Welcome to FindLOS Pro, {user?.name?.split(" ")[0] || "there"}!
                            </p>
                        </div>

                        <div className="bg-surface-elevated rounded-xl p-4 space-y-3 text-left">
                            <p className="text-xs font-semibold text-text-brand-secondary uppercase tracking-wider">
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
                                        <CheckCircle2 className="h-4 w-4 text-status-success flex-shrink-0" />
                                        <span className="text-sm text-text-brand-secondary">{feature}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                asChild
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white h-11"
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
                                className="w-full border-surface-border-light text-text-brand-secondary hover:text-text-brand-primary hover:bg-surface-overlay"
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
        </PageShell>
    );
}