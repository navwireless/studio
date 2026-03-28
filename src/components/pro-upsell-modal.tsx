// src/components/pro-upsell-modal.tsx
"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Check,
  Zap,
  Infinity,
  Upload,
  Headphones,
  FileText,
  Code,
} from "lucide-react";
import RazorpayCheckout from "@/components/razorpay-checkout";

interface ProUpsellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** If true, the dialog cannot be dismissed (used for zero-credit block) */
  blocking?: boolean;
  /** Trigger context for analytics */
  trigger?: "zero_credits" | "low_credits" | "bulk_gate" | "manual";
}

const FEATURES = [
  { icon: <Infinity className="h-4 w-4" />, label: "Unlimited LOS analyses" },
  { icon: <Upload className="h-4 w-4" />, label: "Bulk link analysis (CSV upload)" },
  { icon: <Headphones className="h-4 w-4" />, label: "Priority support" },
  { icon: <Zap className="h-4 w-4" />, label: "24/7 assistance" },
  { icon: <FileText className="h-4 w-4" />, label: "Advanced PDF reports" },
  { icon: <Code className="h-4 w-4" />, label: "API access (coming soon)" },
];

export default function ProUpsellModal({
  open,
  onOpenChange,
  blocking = false,
}: ProUpsellModalProps) {
  const router = useRouter();

  const handleOpenChange = (value: boolean) => {
    if (blocking && !value) return; // Prevent closing if blocking
    onOpenChange(value);
  };

  const handlePaymentSuccess = () => {
    onOpenChange(false);
    router.push("/payment/success");
  };

  const handlePaymentFailure = () => {
    // Keep modal open — user can try again or go to pricing
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className="sm:max-w-md bg-slate-900/98 border-white/10 backdrop-blur-2xl"
        onPointerDownOutside={(e) => {
          if (blocking) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (blocking) e.preventDefault();
        }}
      >
        <DialogHeader className="text-center space-y-3 pt-2">
          {/* Pro badge */}
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500/20 to-teal-500/20 border border-purple-500/20 flex items-center justify-center">
            <Zap className="h-7 w-7 text-purple-400" />
          </div>
          <DialogTitle className="text-xl font-bold text-white">
            Upgrade to FindLOS Pro
          </DialogTitle>
          <DialogDescription className="text-white/50 text-sm">
            {blocking
              ? "You've used all your credits. Upgrade to Pro for unlimited analyses."
              : "Unlock the full power of FindLOS with a Pro subscription."}
          </DialogDescription>
        </DialogHeader>

        {/* Pricing */}
        <div className="text-center py-3">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-3xl font-bold text-white">₹500</span>
            <span className="text-white/40 text-sm">/month</span>
          </div>
          <p className="text-xs text-white/30 mt-1">Cancel anytime • No hidden fees</p>
        </div>

        {/* Features */}
        <div className="space-y-2.5 py-2">
          {FEATURES.map((feature, i) => (
            <div key={i} className="flex items-center gap-3 px-2">
              <div className="w-6 h-6 rounded-full bg-teal-500/10 border border-teal-500/20 flex items-center justify-center flex-shrink-0">
                <Check className="h-3 w-3 text-teal-400" />
              </div>
              <div className="flex items-center gap-2 text-sm text-white/70">
                {feature.icon}
                <span>{feature.label}</span>
              </div>
            </div>
          ))}
        </div>

        <DialogFooter className="flex flex-col gap-2 sm:flex-col pt-2">
          {/* Razorpay Checkout Button */}
          <RazorpayCheckout
            onSuccess={handlePaymentSuccess}
            onFailure={handlePaymentFailure}
          />

          {/* View full pricing page */}
          <Button
            variant="ghost"
            asChild
            className="w-full text-white/40 hover:text-white/60 hover:bg-white/5 text-xs"
          >
            <Link href="/pricing">View Full Pricing Details</Link>
          </Button>

          {!blocking && (
            <Button
              variant="ghost"
              onClick={() => onOpenChange(false)}
              className="w-full text-white/40 hover:text-white/60 hover:bg-white/5"
            >
              Maybe Later
            </Button>
          )}

          {blocking && (
            <Button
              variant="ghost"
              asChild
              className="w-full text-white/40 hover:text-white/60 hover:bg-white/5"
            >
              <a href="mailto:support@findlos.com">Contact Admin</a>
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}