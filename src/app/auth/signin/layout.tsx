// src/app/auth/signin/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to FindLOS with your Google account to access professional line-of-sight feasibility analysis tools by Nav Wireless Technologies.",
};

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}