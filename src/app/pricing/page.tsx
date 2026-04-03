// src/app/pricing/page.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Check,
    X,
    Zap,
    Infinity,
    Upload,
    Headphones,
    FileText,
    Code,
    Shield,
    Lock,
    ChevronDown,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { PageShell } from "@/components/layout/page-shell";
import RazorpayCheckout from "@/components/razorpay-checkout";
import { useAuth } from "@/hooks/use-auth";
import { BRAND } from "@/styles/design-tokens";
import { format } from "date-fns";

interface FeatureRow {
    label: string;
    free: boolean | string;
    pro: boolean | string;
}

const FEATURE_COMPARISON: FeatureRow[] = [
    { label: "Single LOS analysis", free: true, pro: true },
    { label: "Elevation profile charts", free: true, pro: true },
    { label: "PDF report generation", free: true, pro: true },
    { label: "Fiber path calculation", free: true, pro: true },
    { label: "Analysis history & export", free: true, pro: true },
    { label: "Number of analyses", free: "10 (one-time)", pro: "Unlimited" },
    { label: "Bulk LOS analysis (KMZ)", free: false, pro: true },
    { label: "Priority support", free: false, pro: true },
    { label: "24/7 assistance", free: false, pro: true },
    { label: "API access", free: false, pro: "Coming soon" },
];

const FAQ_ITEMS = [
    {
        question: "What happens after 10 free analyses?",
        answer: "Once you've used your 10 free analyses, you'll need to upgrade to the Pro plan for unlimited analyses. Your existing analysis history and reports remain accessible.",
    },
    {
        question: "Can I cancel anytime?",
        answer: "Yes! Your Pro plan is billed monthly. If you don't renew, your plan simply expires at the end of the billing period. No cancellation fees.",
    },
    {
        question: "What payment methods are accepted?",
        answer: "We accept all major credit/debit cards (Visa, Mastercard, Rupay), UPI, net banking, and popular wallets through Razorpay — India's most trusted payment gateway.",
    },
    {
        question: "Is my payment information secure?",
        answer: "Absolutely. All payments are processed through Razorpay with 256-bit SSL encryption. We never store your card details on our servers.",
    },
    {
        question: "What is bulk LOS analysis?",
        answer: "Bulk analysis lets you upload a KMZ file with multiple tower locations and automatically analyze Line-of-Sight between all point pairs within a specified radius. It's perfect for network planning across large areas.",
    },
    {
        question: "What happens when my Pro plan expires?",
        answer: "When your Pro plan expires, your account reverts to the free plan. You keep your remaining credits and all your analysis history. You can renew anytime to get unlimited analyses again.",
    },
];

export default function PricingPage() {
    const { plan } = useAuth();
    const router = useRouter();
    const [proExpiresAt] = useState<string | null>(null);

    const handlePaymentSuccess = (expiresAt: string) => {
        router.push("/payment/success");
        void expiresAt;
    };

    const handlePaymentFailure = () => {
        router.push("/payment/failure");
    };

    return (
        <PageShell
            title="Choose Your Plan"
            description="Start with 10 free analyses, then upgrade to Pro for unlimited access and advanced features."
            breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Pricing" },
            ]}
            maxWidth="lg"
        >
            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
                {/* Free Plan */}
                <Card className="bg-surface-card border-surface-border">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg text-text-brand-secondary">Free</CardTitle>
                        <div className="flex items-baseline justify-center gap-1 mt-2">
                            <span className="text-3xl font-bold text-text-brand-primary">₹0</span>
                            <span className="text-text-brand-muted text-sm">/forever</span>
                        </div>
                        {plan === "free" && (
                            <Badge className="mt-2 bg-status-success/10 text-status-success border-status-success/30">
                                Current Plan
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        {[
                            { label: "10 LOS analyses (one-time)", included: true },
                            { label: "Single link analysis", included: true },
                            { label: "Elevation profile charts", included: true },
                            { label: "PDF report generation", included: true },
                            { label: "Fiber path calculation", included: true },
                            { label: "Bulk LOS analysis", included: false },
                            { label: "Priority support", included: false },
                            { label: "Unlimited analyses", included: false },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                {feature.included ? (
                                    <Check className="h-4 w-4 text-status-success flex-shrink-0" />
                                ) : (
                                    <X className="h-4 w-4 text-text-brand-disabled flex-shrink-0" />
                                )}
                                <span
                                    className={`text-sm ${feature.included ? "text-text-brand-secondary" : "text-text-brand-disabled"}`}
                                >
                                    {feature.label}
                                </span>
                            </div>
                        ))}

                        <div className="pt-4">
                            {plan === "free" ? (
                                <Button
                                    disabled
                                    variant="outline"
                                    className="w-full border-surface-border text-text-brand-disabled cursor-not-allowed"
                                >
                                    Current Plan
                                </Button>
                            ) : (
                                <p className="text-xs text-text-brand-muted text-center">
                                    You&apos;re on Pro — free features are included.
                                </p>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Pro Plan */}
                <Card className="bg-gradient-to-b from-purple-500/5 to-brand-500/5 border-purple-500/20 relative overflow-hidden">
                    <div className="absolute top-0 right-0 px-3 py-1 bg-purple-500/20 text-purple-300 text-xs font-semibold rounded-bl-lg">
                        RECOMMENDED
                    </div>
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-lg text-text-brand-primary">Pro</CardTitle>
                        <div className="flex items-baseline justify-center gap-1 mt-2">
                            <span className="text-3xl font-bold text-text-brand-primary">₹500</span>
                            <span className="text-text-brand-muted text-sm">/month</span>
                        </div>
                        {plan === "pro" && (
                            <Badge className="mt-2 bg-purple-500/10 text-purple-400 border-purple-500/20">
                                Current Plan
                            </Badge>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-3 pt-4">
                        {[
                            { icon: <Infinity className="h-4 w-4" />, label: "Unlimited LOS analyses" },
                            { icon: <Upload className="h-4 w-4" />, label: "Bulk LOS analysis (KMZ)" },
                            { icon: <Headphones className="h-4 w-4" />, label: "Priority support" },
                            { icon: <Zap className="h-4 w-4" />, label: "24/7 assistance" },
                            { icon: <FileText className="h-4 w-4" />, label: "Advanced PDF reports" },
                            { icon: <Shield className="h-4 w-4" />, label: "Dedicated account manager" },
                            { icon: <Code className="h-4 w-4" />, label: "API access (coming soon)" },
                        ].map((feature, i) => (
                            <div key={i} className="flex items-center gap-2.5">
                                <div className="w-5 h-5 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                                    <Check className="h-3 w-3 text-purple-400" />
                                </div>
                                <div className="flex items-center gap-2 text-sm text-text-brand-secondary">
                                    {feature.icon}
                                    <span>{feature.label}</span>
                                </div>
                            </div>
                        ))}

                        <div className="pt-4">
                            {plan === "pro" ? (
                                <div className="space-y-2">
                                    <Button
                                        disabled
                                        className="w-full bg-purple-600/50 text-text-brand-disabled cursor-not-allowed"
                                    >
                                        You&apos;re on Pro
                                    </Button>
                                    {proExpiresAt && (
                                        <p className="text-xs text-text-brand-muted text-center">
                                            Expires: {format(new Date(proExpiresAt), "MMM d, yyyy")}
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <RazorpayCheckout
                                    onSuccess={handlePaymentSuccess}
                                    onFailure={handlePaymentFailure}
                                />
                            )}
                            <p className="text-xs text-text-brand-muted text-center mt-2">
                                Cancel anytime • No hidden fees
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Feature Comparison Table */}
            <div className="mt-16 max-w-3xl mx-auto">
                <h2 className="text-lg font-semibold text-text-brand-primary text-center mb-6">
                    Feature Comparison
                </h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-surface-border">
                                <th className="text-left py-3 px-4 text-xs font-medium text-text-brand-muted">
                                    Feature
                                </th>
                                <th className="text-center py-3 px-4 text-xs font-medium text-text-brand-muted w-28">
                                    Free
                                </th>
                                <th className="text-center py-3 px-4 text-xs font-medium text-purple-400 w-28">
                                    Pro
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {FEATURE_COMPARISON.map((row, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-surface-border/50 hover:bg-surface-overlay/30"
                                >
                                    <td className="py-2.5 px-4 text-sm text-text-brand-secondary">
                                        {row.label}
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        {typeof row.free === "boolean" ? (
                                            row.free ? (
                                                <Check className="h-4 w-4 text-status-success mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-text-brand-disabled mx-auto" />
                                            )
                                        ) : (
                                            <span className="text-xs text-text-brand-muted">{row.free}</span>
                                        )}
                                    </td>
                                    <td className="py-2.5 px-4 text-center">
                                        {typeof row.pro === "boolean" ? (
                                            row.pro ? (
                                                <Check className="h-4 w-4 text-purple-400 mx-auto" />
                                            ) : (
                                                <X className="h-4 w-4 text-text-brand-disabled mx-auto" />
                                            )
                                        ) : (
                                            <span className="text-xs text-purple-400 font-medium">
                                                {row.pro}
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6">
                <div className="flex items-center gap-2 text-text-brand-disabled">
                    <Shield className="h-4 w-4" />
                    <span className="text-xs">Secured by Razorpay</span>
                </div>
                <div className="flex items-center gap-2 text-text-brand-disabled">
                    <Lock className="h-4 w-4" />
                    <span className="text-xs">256-bit SSL Encryption</span>
                </div>
                <div className="flex items-center gap-2 text-text-brand-disabled">
                    <ChevronDown className="h-4 w-4 rotate-90" />
                    <span className="text-xs">Cancel Anytime</span>
                </div>
            </div>

            {/* FAQ Section */}
            <div className="mt-16 max-w-2xl mx-auto">
                <h2 className="text-lg font-semibold text-text-brand-primary text-center mb-6">
                    Frequently Asked Questions
                </h2>
                <Accordion type="single" collapsible className="space-y-2">
                    {FAQ_ITEMS.map((item, i) => (
                        <AccordionItem
                            key={i}
                            value={`faq-${i}`}
                            className="border border-surface-border rounded-lg px-4 bg-surface-card/50"
                        >
                            <AccordionTrigger className="text-sm text-text-brand-secondary hover:text-text-brand-primary hover:no-underline py-3">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-sm text-text-brand-muted pb-3">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>

            {/* Contact */}
            <div className="mt-12 text-center pb-8">
                <p className="text-sm text-text-brand-disabled">
                    Need a custom plan or have questions?{" "}
                    <a
                        href={`mailto:${BRAND.supportEmail}`}
                        className="text-brand-400 hover:text-brand-300 underline underline-offset-2"
                    >
                        Contact our team
                    </a>
                </p>
            </div>
        </PageShell>
    );
}