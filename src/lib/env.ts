// src/lib/env.ts

/**
 * Environment variable validation and type-safe access.
 * Import this module early in server-side code to catch missing env vars at startup.
 */

function getRequiredEnv(name: string): string {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        throw new Error(
            `❌ Missing required environment variable: ${name}\n` +
            `   Please add it to your .env.local file or deployment environment.`
        );
    }
    return value.trim();
}

function getOptionalEnv(name: string, fallback?: string): string | undefined {
    const value = process.env[name];
    if (!value || value.trim() === "") {
        if (fallback) return fallback;
        return undefined;
    }
    return value.trim();
}

/**
 * Validated server-side environment variables.
 * Accessing any property will throw if the required env var is missing.
 */
class ServerEnv {
    private _cache: Record<string, string> = {};

    private getRequired(name: string): string {
        if (!this._cache[name]) {
            this._cache[name] = getRequiredEnv(name);
        }
        return this._cache[name];
    }

    // ── Auth ──
    get GOOGLE_CLIENT_ID(): string {
        return this.getRequired("GOOGLE_CLIENT_ID");
    }

    get GOOGLE_CLIENT_SECRET(): string {
        return this.getRequired("GOOGLE_CLIENT_SECRET");
    }

    get NEXTAUTH_URL(): string {
        return this.getRequired("NEXTAUTH_URL");
    }

    get NEXTAUTH_SECRET(): string {
        return this.getRequired("NEXTAUTH_SECRET");
    }

    // ── Firebase ──
    get FIREBASE_PROJECT_ID(): string {
        return this.getRequired("FIREBASE_PROJECT_ID");
    }

    get FIREBASE_CLIENT_EMAIL(): string {
        return this.getRequired("FIREBASE_CLIENT_EMAIL");
    }

    get FIREBASE_PRIVATE_KEY(): string {
        return this.getRequired("FIREBASE_PRIVATE_KEY");
    }

    // ── Razorpay ──
    get RAZORPAY_KEY_ID(): string {
        return this.getRequired("RAZORPAY_KEY_ID");
    }

    get RAZORPAY_KEY_SECRET(): string {
        return this.getRequired("RAZORPAY_KEY_SECRET");
    }

    get RAZORPAY_WEBHOOK_SECRET(): string {
        return this.getRequired("RAZORPAY_WEBHOOK_SECRET");
    }

    // ── Google APIs ──
    get GOOGLE_ELEVATION_API_KEY(): string {
        return this.getRequired("GOOGLE_ELEVATION_API_KEY");
    }

    // ── Optional ──
    get ADMIN_EMAIL(): string | undefined {
        return getOptionalEnv("ADMIN_EMAIL");
    }
}

/**
 * Validated client-side environment variables.
 * These must be prefixed with NEXT_PUBLIC_ to be available in the browser.
 */
class ClientEnv {
    get NEXT_PUBLIC_RAZORPAY_KEY_ID(): string {
        const value = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
        if (!value || value.trim() === "") {
            console.warn(
                "⚠️ Missing NEXT_PUBLIC_RAZORPAY_KEY_ID — Razorpay checkout will not work."
            );
            return "";
        }
        return value.trim();
    }

    get NEXT_PUBLIC_GOOGLE_MAPS_API_KEY(): string {
        const value = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!value || value.trim() === "") {
            console.warn(
                "⚠️ Missing NEXT_PUBLIC_GOOGLE_MAPS_API_KEY — Maps will not load."
            );
            return "";
        }
        return value.trim();
    }
}

/** Server-side environment variables (type-safe, validated on access) */
export const serverEnv = new ServerEnv();

/** Client-side environment variables (warns on missing, does not throw) */
export const clientEnv = new ClientEnv();

/**
 * Validate all required server environment variables at once.
 * Call this during server startup or in a health check route.
 * Returns a list of missing variable names, or empty array if all present.
 */
export function validateAllServerEnv(): { valid: boolean; missing: string[] } {
    const requiredKeys = [
        "GOOGLE_CLIENT_ID",
        "GOOGLE_CLIENT_SECRET",
        "NEXTAUTH_URL",
        "NEXTAUTH_SECRET",
        "FIREBASE_PROJECT_ID",
        "FIREBASE_CLIENT_EMAIL",
        "FIREBASE_PRIVATE_KEY",
        "RAZORPAY_KEY_ID",
        "RAZORPAY_KEY_SECRET",
        "RAZORPAY_WEBHOOK_SECRET",
        "GOOGLE_ELEVATION_API_KEY",
    ];

    const missing: string[] = [];

    for (const key of requiredKeys) {
        const value = process.env[key];
        if (!value || value.trim() === "") {
            missing.push(key);
        }
    }

    if (missing.length > 0) {
        console.error(
            `\n❌ Missing required environment variables:\n${missing.map((k) => `   - ${k}`).join("\n")}\n`
        );
    }

    // Check optional but recommended
    const optionalKeys = [
        "NEXT_PUBLIC_RAZORPAY_KEY_ID",
        "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY",
    ];

    for (const key of optionalKeys) {
        const value = process.env[key];
        if (!value || value.trim() === "") {
            console.warn(`⚠️ Optional environment variable not set: ${key}`);
        }
    }

    return { valid: missing.length === 0, missing };
}

/**
 * Quick startup check — logs warnings but doesn't throw.
 * Safe to call in layout.tsx or any server component.
 */
export function checkEnvOnStartup(): void {
    if (typeof window !== "undefined") return; // Skip on client

    const { valid, missing } = validateAllServerEnv();
    if (valid) {
        console.log("✅ All required environment variables are configured.");
    } else {
        console.error(
            `⚠️ Application may not function correctly. Missing: ${missing.join(", ")}`
        );
    }
}