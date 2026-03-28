// src/lib/authOptions.ts
import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { isAdminSDKInitialized } from "@/lib/firebaseAdmin";
import { Timestamp } from "firebase-admin/firestore";
import {
  createUser,
  getUserById,
} from "@/lib/firestore";
import type {
  UserRole,
  UserStatus,
  UserPlan,
} from "@/types/auth";

// ============================================
// NextAuth Module Augmentation
// ============================================

declare module "next-auth" {
  interface Session {
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
    };
  }

  interface User {
    id: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
    status: UserStatus;
    credits: number;
    plan: UserPlan;
    planExpiresAt?: string | null;
  }
}

// ============================================
// Environment validation
// ============================================

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error(
    "AUTH_CONFIG_ERROR: Missing Google OAuth Client ID or Secret. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local"
  );
}
if (!NEXTAUTH_SECRET) {
  console.error(
    "AUTH_CONFIG_ERROR: Missing NEXTAUTH_SECRET. Ensure it is set in .env.local"
  );
}

// ============================================
// Helper: Check and handle expired pro plans
// ============================================

async function checkAndHandleExpiredPlan(userId: string, userData: {
  plan: UserPlan;
  planExpiresAt: { toDate: () => Date } | null;
  credits: number;
}): Promise<{ plan: UserPlan; planExpiresAt: string | null }> {
  if (
    userData.plan === "pro" &&
    userData.planExpiresAt &&
    userData.planExpiresAt.toDate() < new Date()
  ) {
    // Plan has expired — downgrade to free
    try {
      const { db } = await import("@/lib/firebaseAdmin");
      const { logCreditTransaction } = await import("@/lib/firestore");
      const firestore = db();

      await firestore.collection("users").doc(userId).update({
        plan: "free",
        planExpiresAt: null,
        updatedAt: Timestamp.now(),
      });

      await logCreditTransaction({
        userId,
        type: "pro_subscription",
        amount: 0,
        balanceBefore: userData.credits,
        balanceAfter: userData.credits,
        reason: "Pro plan expired — downgraded to free",
        performedBy: null,
        relatedAnalysisId: null,
      });

      console.log(`AUTH_PLAN_EXPIRED: User ${userId} Pro plan expired. Downgraded to free.`);
      return { plan: "free", planExpiresAt: null };
    } catch (err) {
      console.error(`AUTH_PLAN_EXPIRY_ERROR: Failed to downgrade user ${userId}:`, err);
      return {
        plan: userData.plan,
        planExpiresAt: userData.planExpiresAt?.toDate().toISOString() || null,
      };
    }
  }

  return {
    plan: userData.plan,
    planExpiresAt: userData.planExpiresAt?.toDate().toISOString() || null,
  };
}

// ============================================
// NextAuth Options
// ============================================

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID || "",
      clientSecret: GOOGLE_CLIENT_SECRET || "",
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),
  ],
  secret: NEXTAUTH_SECRET,
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async signIn({ user }) {
      if (!user.id || !user.email) {
        console.error(
          "AUTH_SIGNIN_ERROR: User ID or email missing from provider response."
        );
        return false;
      }

      if (!isAdminSDKInitialized()) {
        console.error(
          "AUTH_SIGNIN_ERROR: Firebase Admin SDK not initialized. Cannot process sign-in."
        );
        return false;
      }

      try {
        const existingUser = await getUserById(user.id);

        if (!existingUser) {
          await createUser({
            id: user.id,
            email: user.email,
            displayName: user.name || null,
            photoURL: user.image || null,
          });
          console.log(
            `AUTH_SIGNIN_SUCCESS: New user registered: ${user.email} (ID: ${user.id})`
          );
        } else {
          const { db } = await import("@/lib/firebaseAdmin");
          const firestore = db();
          await firestore.collection("users").doc(user.id).update({
            lastLoginAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
            email: user.email,
            displayName: user.name || existingUser.displayName,
            photoURL: user.image || existingUser.photoURL,
          });
          console.log(
            `AUTH_SIGNIN_SUCCESS: Existing user logged in: ${user.email} (ID: ${user.id}, status: ${existingUser.status})`
          );
        }
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : String(err);
        console.error(
          `AUTH_SIGNIN_FIRESTORE_ERROR: Error during signIn for user ${user.email} (ID: ${user.id}):`,
          errorMessage
        );
        return false;
      }
    },

    async jwt({ token, user, trigger }) {
      // On initial sign-in, `user` is present
      if (user?.id) {
        token.id = user.id;
      }

      // Fetch fresh data from Firestore on sign-in or when session is updated
      if (
        (user?.id || trigger === "update") &&
        token.id &&
        isAdminSDKInitialized()
      ) {
        try {
          const userData = await getUserById(token.id);
          if (userData) {
            token.role = userData.role;
            token.status = userData.status;
            token.credits = userData.credits;
            token.name = userData.displayName || token.name;
            token.picture = userData.photoURL || token.picture;

            // Check for expired pro plan and handle it
            const planStatus = await checkAndHandleExpiredPlan(
              token.id,
              {
                plan: userData.plan,
                planExpiresAt: userData.planExpiresAt,
                credits: userData.credits,
              }
            );
            token.plan = planStatus.plan;
            token.planExpiresAt = planStatus.planExpiresAt;
          } else {
            token.role = "user";
            token.status = "pending_approval";
            token.credits = 0;
            token.plan = "free";
            token.planExpiresAt = null;
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : String(err);
          console.error(
            `AUTH_JWT_FIRESTORE_ERROR: Error fetching user details for JWT (ID: ${token.id}):`,
            errorMessage
          );
          if (!token.role) token.role = "user";
          if (!token.status) token.status = "pending_approval";
          if (token.credits === undefined) token.credits = 0;
          if (!token.plan) token.plan = "free";
          if (token.planExpiresAt === undefined) token.planExpiresAt = null;
        }
      }

      // Ensure defaults are always set
      if (!token.role) token.role = "user";
      if (!token.status) token.status = "pending_approval";
      if (token.credits === undefined) token.credits = 0;
      if (!token.plan) token.plan = "free";
      if (token.planExpiresAt === undefined) token.planExpiresAt = null;

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.status = token.status;
        session.user.credits = token.credits;
        session.user.plan = token.plan;
        session.user.planExpiresAt = token.planExpiresAt;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture as string | null | undefined;
      }

      // Refresh from Firestore for absolute latest data
      if (token.id && isAdminSDKInitialized()) {
        try {
          const userData = await getUserById(token.id);
          if (userData) {
            session.user.role = userData.role;
            session.user.status = userData.status;
            session.user.credits = userData.credits;

            // Check expiry in session callback too
            const planStatus = await checkAndHandleExpiredPlan(
              token.id,
              {
                plan: userData.plan,
                planExpiresAt: userData.planExpiresAt,
                credits: userData.credits,
              }
            );
            session.user.plan = planStatus.plan;
            session.user.planExpiresAt = planStatus.planExpiresAt;
          }
        } catch {
          console.warn(
            `AUTH_SESSION_WARNING: Could not refresh session from Firestore for user ${token.id}`
          );
        }
      }

      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
};