// src/lib/firestore.ts
// Server-only Firestore helper functions for user CRUD and credit transactions
import { db } from "@/lib/firebaseAdmin";
import { Timestamp, FieldValue } from "firebase-admin/firestore";
import type {
    FirestoreUser,
    UserRole,
    UserStatus,
    UserPlan,
    CreditTransactionType,
    CreditTransactionDoc,
} from "@/types/auth";

// ============================================
// User CRUD
// ============================================

interface CreateUserInput {
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
}

/**
 * Creates a new user document in Firestore with default values.
 * 10 free credits, status: pending_approval, role: user, plan: free.
 */
export async function createUser(profile: CreateUserInput): Promise<FirestoreUser> {
    const firestore = db();
    const now = Timestamp.now();

    const newUser: FirestoreUser = {
        email: profile.email,
        displayName: profile.displayName,
        photoURL: profile.photoURL,
        role: "user" as UserRole,
        status: "pending_approval" as UserStatus,
        credits: 10,
        totalCreditsUsed: 0,
        plan: "free" as UserPlan,
        planExpiresAt: null,
        createdAt: now,
        updatedAt: now,
        lastLoginAt: now,
        approvedBy: null,
        approvedAt: null,
        metadata: null,
    };

    await firestore.collection("users").doc(profile.id).set(newUser);

    // Log the initial credit grant
    await logCreditTransaction({
        userId: profile.id,
        type: "initial_grant",
        amount: 10,
        balanceBefore: 0,
        balanceAfter: 10,
        reason: "Welcome bonus — 10 free credits on signup",
        performedBy: null,
        relatedAnalysisId: null,
    });

    console.log(
        `FIRESTORE_USER_CREATED: ${profile.email} (ID: ${profile.id}) — 10 credits granted`
    );

    return newUser;
}

/**
 * Fetch a user document by ID.
 * Returns null if user doesn't exist.
 */
export async function getUserById(
    userId: string
): Promise<(FirestoreUser & { id: string }) | null> {
    const firestore = db();
    const doc = await firestore.collection("users").doc(userId).get();

    if (!doc.exists) {
        return null;
    }

    return { id: doc.id, ...(doc.data() as FirestoreUser) };
}

/**
 * Fetch a user document by email.
 * Returns null if not found.
 */
export async function getUserByEmail(
    email: string
): Promise<(FirestoreUser & { id: string }) | null> {
    const firestore = db();
    const snapshot = await firestore
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (snapshot.empty) {
        return null;
    }

    const doc = snapshot.docs[0];
    return { id: doc.id, ...(doc.data() as FirestoreUser) };
}

/**
 * Partial update of a user document.
 * Automatically sets updatedAt.
 */
export async function updateUser(
    userId: string,
    data: Partial<Omit<FirestoreUser, "createdAt">>
): Promise<void> {
    const firestore = db();
    await firestore
        .collection("users")
        .doc(userId)
        .update({
            ...data,
            updatedAt: Timestamp.now(),
        });
}

/**
 * Update lastLoginAt timestamp for a user.
 */
export async function updateLastLogin(userId: string): Promise<void> {
    const firestore = db();
    await firestore.collection("users").doc(userId).update({
        lastLoginAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
    });
}

/**
 * Deduct credits from a user. Returns the new balance.
 * Throws if insufficient credits.
 */
export async function deductCredits(
    userId: string,
    amount: number,
    reason: string,
    relatedAnalysisId: string | null = null
): Promise<number> {
    const firestore = db();
    const userRef = firestore.collection("users").doc(userId);

    return firestore.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
            throw new Error(`User ${userId} not found`);
        }

        const userData = userDoc.data() as FirestoreUser;
        const currentCredits = userData.credits;

        if (currentCredits < amount) {
            throw new Error(
                `Insufficient credits. Has ${currentCredits}, needs ${amount}.`
            );
        }

        const newBalance = currentCredits - amount;

        transaction.update(userRef, {
            credits: newBalance,
            totalCreditsUsed: FieldValue.increment(amount),
            updatedAt: Timestamp.now(),
        });

        // Log transaction (outside the Firestore transaction for simplicity,
        // but we do it after the update succeeds)
        return newBalance;
    }).then(async (newBalance) => {
        const user = await getUserById(userId);
        await logCreditTransaction({
            userId,
            type: "analysis_deduction",
            amount: -amount,
            balanceBefore: (user?.credits ?? newBalance) + amount,
            balanceAfter: newBalance,
            reason,
            performedBy: null,
            relatedAnalysisId,
        });
        return newBalance;
    });
}

// ============================================
// Credit Transactions
// ============================================

interface LogCreditTransactionInput {
    userId: string;
    type: CreditTransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    reason: string;
    performedBy: string | null;
    relatedAnalysisId: string | null;
}

/**
 * Log a credit transaction to the creditTransactions collection.
 */
export async function logCreditTransaction(
    input: LogCreditTransactionInput
): Promise<string> {
    const firestore = db();
    const now = Timestamp.now();

    const doc: CreditTransactionDoc = {
        userId: input.userId,
        type: input.type,
        amount: input.amount,
        balanceBefore: input.balanceBefore,
        balanceAfter: input.balanceAfter,
        reason: input.reason,
        performedBy: input.performedBy,
        relatedAnalysisId: input.relatedAnalysisId,
        createdAt: now,
    };

    const ref = await firestore.collection("creditTransactions").add(doc);
    return ref.id;
}