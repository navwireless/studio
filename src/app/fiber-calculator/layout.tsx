// src/app/fiber-calculator/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Fiber Path Calculator",
  description: "Calculate fiber optic cable path distances along road networks between two points.",
};

export default function FiberCalculatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}