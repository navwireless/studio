
import type { NextAuthOptions, DefaultSession } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { db, isAdminSDKInitialized } from '@/lib/firebaseAdmin'; // Use db() getter
import { Timestamp } from 'firebase-admin/firestore';
import type { UserProfile, Role, ProPlanType } from '@/types';

// Define how the user profile from Firestore maps to the NextAuth User object
// And how the session object should be structured
declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      id: string;
      role?: Role;
      proPlan?: ProPlanType | null;
      credits?: {
        losAnalysis: number;
        bulkAnalysis: number;
      };
      lastLogin?: string; // ISO string
      // Retain default properties like name, email, image from DefaultSession['user']
    } & DefaultSession['user']; // Include name, email, image
  }

  interface User { // The User object returned by providers or authorize callback
    id: string;
    role?: Role;
    proPlan?: ProPlanType | null;
    credits?: {
      losAnalysis: number;
      bulkAnalysis: number;
    };
    // Default NextAuth properties are fine here (name, email, image)
  }
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const NEXTAUTH_SECRET = process.env.NEXTAUTH_SECRET;

if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
  console.error('AUTH_CONFIG_ERROR: Missing Google OAuth Client ID or Secret. Ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.local');
}
if (!NEXTAUTH_SECRET) {
  console.error('AUTH_CONFIG_ERROR: Missing NEXTAUTH_SECRET. Ensure it is set in .env.local');
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: GOOGLE_CLIENT_ID || '',
      clientSecret: GOOGLE_CLIENT_SECRET || '',
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
    strategy: 'jwt', // Using JWT for session strategy
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async signIn({ user, account: _account, profile: _profile }) {
      if (!user.id || !user.email) {
        console.error('AUTH_SIGNIN_ERROR: User ID or email missing from provider response.');
        return false; // Deny sign-in
      }

      if (!isAdminSDKInitialized()) {
        console.error('AUTH_SIGNIN_ERROR: Firebase Admin SDK not initialized. Cannot process sign-in.');
        return false; // Or redirect to an error page: return '/auth/error?error=AdminSDKInitFailed';
      }

      try {
        const firestore = db(); // Use the getter
        const userRef = firestore.collection('users').doc(user.id);
        const userDoc = await userRef.get();

        const now = Timestamp.now();
        const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

        if (!userDoc.exists) {
          // New user
          const newUserProfile: UserProfile = {
            id: user.id,
            email: user.email,
            name: user.name || null,
            role: 'user', // Default role
            proPlan: null,
            planExpiresAt: null,
            credits: { losAnalysis: 5, bulkAnalysis: 1 }, // Initial credits
            createdAt: now,
            updatedAt: now,
            lastLoginAt: now,
            dailyUsage: {
              date: today,
              losAnalysisCount: 0,
              bulkAnalysisCount: 0,
            },
            userActionsCount: 0,
            photoURL: user.image || null,
          };
          await userRef.set(newUserProfile);
          console.log(`AUTH_SIGNIN_SUCCESS: New user registered: ${user.email} (ID: ${user.id})`);
        } else {
          // Existing user
          const userData = userDoc.data() as UserProfile;
          const updates: Partial<UserProfile> = {
            lastLoginAt: now,
            updatedAt: now,
            email: user.email, // Update email in case it changed
            name: user.name || userData.name, // Update name if provided
            photoURL: user.image || userData.photoURL, // Update photo if provided
          };

          // Reset daily usage if it's a new day
          if (userData.dailyUsage?.date !== today) {
            updates.dailyUsage = {
              date: today,
              losAnalysisCount: 0,
              bulkAnalysisCount: 0,
            };
            console.log(`AUTH_SIGNIN_INFO: Daily usage reset for user ${user.id} on ${today}`);
          }
          await userRef.update(updates);
          console.log(`AUTH_SIGNIN_SUCCESS: Existing user logged in: ${user.email} (ID: ${user.id})`);
        }
        return true; // Allow sign-in
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`AUTH_SIGNIN_FIRESTORE_ERROR: Error during signIn for user ${user.email} (ID: ${user.id}):`, errorMessage, error);
        // Depending on the error, you might want to deny sign-in
        // For instance, if the database is unreachable, returning false is safer.
        return false; // Deny sign-in on error
      }
    },

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async jwt({ token, user, account: _account, profile: _profile }) {
      // `user` is only passed on initial sign-in.
      // Persist user data like role and ID to the JWT token.
      if (user?.id) { // Successfully signed in (either new or existing user from signIn callback)
        token.id = user.id;
        // Attempt to fetch role and other details from Firestore to ensure JWT is fresh.
        // This is crucial if roles/details change and you want JWT to reflect that without re-login.
        if (isAdminSDKInitialized()) {
            try {
                const firestore = db();
                const userRef = firestore.collection('users').doc(user.id);
                const userDoc = await userRef.get();
                if (userDoc.exists) {
                    const userData = userDoc.data() as UserProfile;
                    token.role = userData.role;
                    token.proPlan = userData.proPlan;
                    token.credits = userData.credits;
                    token.name = userData.name || token.name;
                    token.picture = userData.photoURL || token.picture;
                } else {
                    // This case should ideally not happen if signIn callback succeeded.
                    console.warn(`AUTH_JWT_WARNING: User document not found for ID ${user.id} after sign-in. Using provider details.`);
                    token.role = 'user'; // Fallback role
                }
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`AUTH_JWT_FIRESTORE_ERROR: Error fetching user details for JWT (ID: ${user.id}):`, errorMessage, error);
                token.role = 'user'; // Fallback role on error
            }
        } else {
            console.error('AUTH_JWT_ERROR: Firebase Admin SDK not initialized. Cannot enrich JWT with Firestore data.');
            token.role = 'user'; // Fallback role
        }
      }
      return token;
    },

    async session({ session, token }) {
      // `token` is the JWT from the `jwt` callback.
      // Assign properties from the token to the session object.
      // This makes them available on `useSession().data.user`.
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role | undefined;
        session.user.proPlan = token.proPlan as ProPlanType | null | undefined;
        session.user.credits = token.credits as { losAnalysis: number; bulkAnalysis: number; } | undefined;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture; // `picture` from JWT is mapped to `image` in session.user by default

        // Optionally, re-fetch latest user data from Firestore for session hydration
        // to ensure the session has the absolute latest info, especially if you don't
        // rely solely on JWT for this or if JWT expiry is long.
        // However, for this app, JWT enrichment should be sufficient for most cases.
        // For critical up-to-date info, direct DB calls in server components/actions are better.

        if (isAdminSDKInitialized()) {
            try {
                const firestore = db();
                const userRef = firestore.collection('users').doc(token.id as string);
                const userDoc = await userRef.get();

                if (userDoc.exists) {
                    const userData = userDoc.data() as UserProfile;
                    const today = new Date().toISOString().split('T')[0];
                    let needsUpdate = false;
                    const updates: Partial<Pick<UserProfile, 'lastLoginAt' | 'dailyUsage'>> = {};

                    // Update lastLoginAt for session activity
                    updates.lastLoginAt = Timestamp.now();
                    needsUpdate = true;

                    // Check and reset daily usage if needed for the current session user
                    if (userData.dailyUsage?.date !== today) {
                        updates.dailyUsage = {
                            date: today,
                            losAnalysisCount: 0,
                            bulkAnalysisCount: 0,
                        };
                         console.log(`AUTH_SESSION_INFO: Daily usage reset for user ${token.id} during session hydration on ${today}`);
                        needsUpdate = true;
                    }
                    
                    if (needsUpdate) {
                        await userRef.update(updates);
                    }
                    
                    // Ensure session reflects the possibly updated/reset daily usage
                    session.user.credits = userData.credits; // Credits from DB
                    session.user.proPlan = userData.proPlan;
                    session.user.role = userData.role;
                    // If dailyUsage was reset, it's updated in DB. Session doesn't typically carry dailyUsage directly.
                    // Credits are the primary concern for the session object.
                } else {
                    console.warn(`AUTH_SESSION_WARNING: User document not found for ID ${token.id} during session hydration.`);
                     // If user doc is gone, what should session reflect?
                    // Setting to minimal guest-like state to prevent errors if session.user is expected.
                    session.user.role = undefined;
                    session.user.proPlan = undefined;
                    session.user.credits = undefined;
                }
            } catch (error) {
                 const errorMessage = error instanceof Error ? error.message : String(error);
                console.error(`AUTH_SESSION_FIRESTORE_ERROR: Error during session hydration for user ID ${token.id}:`, errorMessage, error);
                // Fallback to token data if DB fetch fails, but log it.
                // The session already has data from JWT, so this catch might just log and proceed.
                // Or, if DB is critical, could invalidate parts of session user.
                // For now, we default to what's in the token if DB fails here.
                console.warn(`AUTH_SESSION_WARNING: Using potentially stale data from JWT for user ${token.id} due to Firestore error during session hydration.`);
            }
        } else {
            console.error('AUTH_SESSION_ERROR: Firebase Admin SDK not initialized. Session data might be stale or incomplete.');
        }
      }
      return session;
    },
  },
  pages: {
    signIn: '/auth/signin', // Custom sign-in page
    // signOut: '/auth/signout', // Custom sign-out page (optional)
    error: '/auth/error', // Custom error page (e.g., for OAuth errors)
    // verifyRequest: '/auth/verify-request', // (used for email provider)
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (optional)
  },
  // Debugging can be enabled in development
  // debug: process.env.NODE_ENV === 'development',
};

    