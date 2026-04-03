// src/app/payment/failure/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { XCircle, RefreshCcw, Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageShell } from "@/components/layout/page-shell";
import { BRAND } from "@/styles/design-tokens";

export default function PaymentFailurePage() {
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
                        <div className="mx-auto w-20 h-20 rounded-full bg-status-danger/10 border-2 border-status-danger/20 flex items-center justify-center">
                            <XCircle className="h-10 w-10 text-status-danger" />
                        </div>

                        <div>
                            <h1 className="text-2xl font-bold text-text-brand-primary">
                                Payment Failed
                            </h1>
                            <p className="text-text-brand-muted mt-2">
                                Something went wrong with your payment. Don&apos;t worry — you haven&apos;t been charged.
                            </p>
                        </div>

                        <div className="bg-surface-elevated rounded-xl p-4 space-y-2 text-left">
                            <p className="text-xs font-semibold text-text-brand-secondary uppercase tracking-wider">
                                Common Reasons
                            </p>
                            <ul className="space-y-1.5 text-sm text-text-brand-muted">
                                <li>• Insufficient funds in account</li>
                                <li>• Card declined by bank</li>
                                <li>• Network connectivity issue</li>
                                <li>• Payment session expired</li>
                            </ul>
                        </div>

                        <div className="flex flex-col gap-3 pt-2">
                            <Button
                                asChild
                                className="w-full bg-brand-500 hover:bg-brand-600 text-white h-11"
                            >
                                <Link href="/pricing">
                                    <RefreshCcw className="h-4 w-4 mr-2" />
                                    Try Again
                                </Link>
                            </Button>
                            <Button
                                asChild
                                variant="outline"
                                className="w-full border-surface-border-light text-text-brand-secondary hover:text-text-brand-primary hover:bg-surface-overlay"
                            >
                                <a href={`mailto:${BRAND.supportEmail}`}>
                                    <Mail className="h-4 w-4 mr-2" />
                                    Contact Support
                                </a>
                            </Button>
                            <Button
                                asChild
                                variant="ghost"
                                className="w-full text-text-brand-muted hover:text-text-brand-secondary"
                            >
                                <Link href="/">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to App
                                </Link>
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </PageShell>
    );
}