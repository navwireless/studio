// src/hooks/use-auth.ts
"use client";

import { useSession } from "next-auth/react";
import type { UserRole, UserStatus, UserPlan } from "@/types/auth";

export interface UseAuthReturn {
    /** The full session user object */
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
        role: UserRole;
        status: UserStatus;
        credits: number;
        plan: UserPlan;
        planExpiresAt?: string | null;
    } | null;
    /** Whether the session is currently loading */
    isLoading: boolean;
    /** Whether the user is authenticated */
    isAuthenticated: boolean;
    /** Whether the user has admin role */
    isAdmin: boolean;
    /** Whether the user's account is approved */
    isApproved: boolean;
    /** Whether the user is pending approval */
    isPending: boolean;
    /** Whether the user is suspended */
    isSuspended: boolean;
    /** Whether the user is on the Pro plan (and it hasn't expired) */
    isPro: boolean;
    /** The user's current credit balance */
    credits: number;
    /** The user's current status */
    status: UserStatus | null;
    /** The user's current plan */
    plan: UserPlan | null;
    /** The user's plan expiry date (ISO string) */
    planExpiresAt: string | null;
    /** The user's role */
    role: UserRole | null;
}

export function useAuth(): UseAuthReturn {
    const { data: session, status: sessionStatus } = useSession();

    const isLoading = sessionStatus === "loading";
    const isAuthenticated = sessionStatus === "authenticated" && !!session?.user;

    const user = isAuthenticated ? session.user : null;

    // Check if pro plan is active (not expired)
    const isPro = user?.plan === "pro" && (
        !user?.planExpiresAt || new Date(user.planExpiresAt) > new Date()
    );

    return {
        user: user
            ? {
                id: user.id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
                status: user.status,
                credits: user.credits,
                plan: user.plan,
                planExpiresAt: user.planExpiresAt,
            }
            : null,
        isLoading,
        isAuthenticated,
        isAdmin: user?.role === "admin",
        isApproved: user?.status === "approved",
        isPending: user?.status === "pending_approval",
        isSuspended: user?.status === "suspended",
        isPro,
        credits: user?.credits ?? 0,
        status: user?.status ?? null,
        plan: user?.plan ?? null,
        planExpiresAt: user?.planExpiresAt ?? null,
        role: user?.role ?? null,
    };
}