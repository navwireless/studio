// src/scripts/set-admin.ts
// Usage: npx tsx src/scripts/set-admin.ts your-email@example.com
//
// This script sets a user as admin in Firestore.
// Requires .env.local with FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local from project root
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

import * as admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

async function main() {
    const email = process.argv[2];

    if (!email) {
        console.error("❌ Usage: npx tsx src/scripts/set-admin.ts <email>");
        console.error("   Example: npx tsx src/scripts/set-admin.ts raj@example.com");
        process.exit(1);
    }

    if (!projectId || !clientEmail || !privateKey) {
        console.error("❌ Missing Firebase environment variables.");
        console.error("   Ensure .env.local has FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY");
        process.exit(1);
    }

    // Initialize Firebase Admin
    if (admin.apps.length === 0) {
        admin.initializeApp({
            credential: admin.credential.cert({ projectId, clientEmail, privateKey }),
            projectId,
        });
    }

    const firestore = admin.firestore();

    console.log(`🔍 Looking up user with email: ${email}`);

    const snapshot = await firestore
        .collection("users")
        .where("email", "==", email)
        .limit(1)
        .get();

    if (snapshot.empty) {
        console.error(`❌ No user found with email: ${email}`);
        console.error("   Make sure the user has signed in at least once.");
        process.exit(1);
    }

    const userDoc = snapshot.docs[0];
    const userData = userDoc.data();

    console.log(`✅ Found user: ${userData.displayName || email} (ID: ${userDoc.id})`);
    console.log(`   Current role: ${userData.role}`);
    console.log(`   Current status: ${userData.status}`);

    if (userData.role === "admin" && userData.status === "approved") {
        console.log("ℹ️  User is already an admin with approved status. No changes needed.");
        process.exit(0);
    }

    await firestore.collection("users").doc(userDoc.id).update({
        role: "admin",
        status: "approved",
        approvedBy: "system_script",
        approvedAt: admin.firestore.Timestamp.now(),
        updatedAt: admin.firestore.Timestamp.now(),
    });

    console.log(`🎉 Success! ${email} is now an admin with approved status.`);
    console.log("   Sign out and sign back in for the changes to take effect in your session.");
    process.exit(0);
}

main().catch((err) => {
    console.error("❌ Script failed:", err);
    process.exit(1);
});