// src/app/payment/failure/page.tsx
"use client";

import React from "react";
import Link from "next/link";
import { XCircle, RefreshCcw, Mail, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import AppHeader from "@/components/layout/app-header";

export default function PaymentFailurePage() {
    return (
        <>
            <AppHeader />
            <div className="flex-1 overflow-y-auto bg-background">
                <div className="max-w-lg mx-auto px-4 py-16 sm:px-6 text-center">
                    <Card className="bg-card/80 backdrop-blur-sm border-white/[0.06]">
                        <CardContent className="pt-10 pb-10 space-y-6">
                            {/* Error Icon */}
                            <div className="mx-auto w-20 h-20 rounded-full bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center">
                                <XCircle className="h-10 w-10 text-red-400" />
                            </div>

                            {/* Title */}
                            <div>
                                <h1 className="text-2xl font-bold text-white">
                                    Payment Failed
                                </h1>
                                <p className="text-white/50 mt-2">
                                    Something went wrong with your payment. Don&apos;t worry — you haven&apos;t been charged.
                                </p>
                            </div>

                            {/* Possible reasons */}
                            <div className="bg-white/[0.03] rounded-xl p-4 space-y-2 text-left">
                                <p className="text-xs font-semibold text-white/60 uppercase tracking-wider">
                                    Common Reasons
                                </p>
                                <ul className="space-y-1.5 text-sm text-white/50">
                                    <li>• Insufficient funds in account</li>
                                    <li>• Card declined by bank</li>
                                    <li>• Network connectivity issue</li>
                                    <li>• Payment session expired</li>
                                </ul>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 pt-2">
                                <Button
                                    asChild
                                    className="w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white h-11"
                                >
                                    <Link href="/pricing">
                                        <RefreshCcw className="h-4 w-4 mr-2" />
                                        Try Again
                                    </Link>
                                </Button>
                                <Button
                                    asChild
                                    variant="outline"
                                    className="w-full border-white/10 text-white/60 hover:text-white hover:bg-white/5"
                                >
                                    <a href="mailto:support@findlos.com">
                                        <Mail className="h-4 w-4 mr-2" />
                                        Contact Support
                                    </a>
                                </Button>
                                <Button
                                    asChild
                                    variant="ghost"
                                    className="w-full text-white/40 hover:text-white/60"
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
            </div>
        </>
    );
}