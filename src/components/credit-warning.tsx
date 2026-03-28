// src/components/credit-warning.tsx
"use client";

import { useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface CreditWarningProps {
    /** Current credit balance */
    credits: number;
    /** Whether to actively show warnings (e.g., after analysis) */
    trigger: boolean;
}

/**
 * Shows toast warnings when credits are low.
 * - At 3 credits: yellow warning
 * - At 1 credit: red warning
 * Does NOT handle zero credits — that's managed by the ProUpsellModal.
 */
export default function CreditWarning({ credits, trigger }: CreditWarningProps) {
    const { toast } = useToast();
    const lastWarningCredits = useRef<number | null>(null);

    useEffect(() => {
        if (!trigger) return;
        if (credits <= 0) return; // Zero is handled by the blocking modal
        if (lastWarningCredits.current === credits) return; // Don't repeat for same level

        if (credits === 1) {
            toast({
                title: "⚠️ Last Credit!",
                description:
                    "This is your last credit. Upgrade to Pro for unlimited LOS analyses.",
                variant: "destructive",
                duration: 8000,
            });
            lastWarningCredits.current = credits;
        } else if (credits <= 3) {
            toast({
                title: "Credits Running Low",
                description: `You have ${credits} credits remaining. Consider upgrading to Pro.`,
                duration: 6000,
            });
            lastWarningCredits.current = credits;
        }
    }, [credits, trigger, toast]);

    return null; // Render nothing — side-effect only component
}