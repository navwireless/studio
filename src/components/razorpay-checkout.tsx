// src/components/razorpay-checkout.tsx
"use client";

import React, { useState, useCallback } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { Loader2, Zap } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";

declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
    }
}

interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    image?: string;
    order_id: string;
    handler: (response: RazorpayResponse) => void;
    prefill: {
        name?: string;
        email?: string;
    };
    theme: {
        color: string;
    };
    modal?: {
        ondismiss?: () => void;
    };
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

interface RazorpayInstance {
    open: () => void;
    on: (event: string, handler: (response: unknown) => void) => void;
}

interface RazorpayCheckoutProps {
    onSuccess?: (expiresAt: string) => void;
    onFailure?: (error: string) => void;
    disabled?: boolean;
    className?: string;
    variant?: "default" | "compact";
}

export default function RazorpayCheckout({
    onSuccess,
    onFailure,
    disabled = false,
    className = "",
    variant = "default",
}: RazorpayCheckoutProps) {
    const { user } = useAuth();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [scriptLoaded, setScriptLoaded] = useState(false);

    const handlePayment = useCallback(async () => {
        if (!scriptLoaded) {
            toast({
                title: "Payment Loading",
                description: "Payment system is loading. Please try again in a moment.",
                variant: "destructive",
            });
            return;
        }

        setIsLoading(true);

        try {
            // Step 1: Create order on server
            const orderResponse = await fetch("/api/razorpay/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const orderData = await orderResponse.json();

            if (!orderResponse.ok || !orderData.success) {
                throw new Error(orderData.error || "Failed to create payment order");
            }

            // Step 2: Open Razorpay checkout
            const options: RazorpayOptions = {
                key: orderData.key,
                amount: orderData.amount,
                currency: orderData.currency,
                name: "Nav Wireless Technologies",
                description: "FindLOS Pro Monthly Subscription",
                order_id: orderData.orderId,
                handler: async (response: RazorpayResponse) => {
                    // Step 3: Verify payment on server
                    try {
                        const verifyResponse = await fetch("/api/razorpay/verify-payment", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_signature: response.razorpay_signature,
                            }),
                        });

                        const verifyData = await verifyResponse.json();

                        if (!verifyResponse.ok || !verifyData.success) {
                            throw new Error(verifyData.error || "Payment verification failed");
                        }

                        toast({
                            title: "🎉 Pro Plan Activated!",
                            description: "You now have unlimited analyses. Enjoy FindLOS Pro!",
                        });

                        // Trigger session refresh
                        await fetch("/api/auth/refresh", { method: "POST" });

                        onSuccess?.(verifyData.expiresAt);
                    } catch (verifyErr) {
                        const msg = verifyErr instanceof Error ? verifyErr.message : "Verification failed";
                        toast({
                            title: "Verification Issue",
                            description: msg + ". If charged, your plan will activate shortly.",
                            variant: "destructive",
                        });
                        onFailure?.(msg);
                    } finally {
                        setIsLoading(false);
                    }
                },
                prefill: {
                    name: user?.name || undefined,
                    email: user?.email || undefined,
                },
                theme: {
                    color: "#1E3A5F",
                },
                modal: {
                    ondismiss: () => {
                        setIsLoading(false);
                    },
                },
            };

            const rzp = new window.Razorpay(options);
            rzp.on("payment.failed", (response: unknown) => {
                const err = response as { error?: { description?: string } };
                const errorMsg = err?.error?.description || "Payment failed";
                toast({
                    title: "Payment Failed",
                    description: errorMsg,
                    variant: "destructive",
                });
                onFailure?.(errorMsg);
                setIsLoading(false);
            });
            rzp.open();
        } catch (err) {
            const message = err instanceof Error ? err.message : "Payment initialization failed";
            toast({
                title: "Payment Error",
                description: message,
                variant: "destructive",
            });
            onFailure?.(message);
            setIsLoading(false);
        }
    }, [scriptLoaded, user, toast, onSuccess, onFailure]);

    if (variant === "compact") {
        return (
            <>
                <Script
                    src="https://checkout.razorpay.com/v1/checkout.js"
                    onLoad={() => setScriptLoaded(true)}
                    strategy="lazyOnload"
                />
                <Button
                    onClick={handlePayment}
                    disabled={disabled || isLoading}
                    size="sm"
                    className={`bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-semibold ${className}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 mr-2 animate-spin" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Zap className="h-3.5 w-3.5 mr-2" />
                            Upgrade ₹500/mo
                        </>
                    )}
                </Button>
            </>
        );
    }

    return (
        <>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                onLoad={() => setScriptLoaded(true)}
                strategy="lazyOnload"
            />
            <Button
                onClick={handlePayment}
                disabled={disabled || isLoading}
                className={`w-full bg-gradient-to-r from-purple-600 to-teal-600 hover:from-purple-500 hover:to-teal-500 text-white font-semibold h-11 ${className}`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Processing Payment...
                    </>
                ) : (
                    <>
                        <Zap className="h-4 w-4 mr-2" />
                        Subscribe Now — ₹500/month
                    </>
                )}
            </Button>
        </>
    );
}