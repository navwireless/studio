// src/app/pricing/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — Free & Pro Plans",
  description:
    "FindLOS pricing plans. Start free with 10 credits or upgrade to Pro for unlimited LOS analyses at ₹500/month.",
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}