
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

This application requires certain environment variables to be set for full functionality, particularly for accessing Google Cloud services and Firebase.

Create a `.env.local` file in the root of your project and add the following variables:

```plaintext
# --- Google Cloud Platform APIs ---

# For Google Elevation API (used in server actions for LOS calculations)
GOOGLE_ELEVATION_API_KEY=YOUR_GOOGLE_ELEVATION_API_KEY_HERE

# For Google Maps JavaScript API (used for client-side maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_JS_API_KEY_HERE

# For Google Directions API (used in server actions for fiber path calculations)
# This key needs the "Directions API" enabled in your Google Cloud Console.
# It can often be the same key as GOOGLE_ELEVATION_API_KEY if that key has broad API access,
# or you can create a separate, more restricted key.
GOOGLE_DIRECTIONS_API_KEY=YOUR_GOOGLE_DIRECTIONS_API_KEY_HERE

# --- NextAuth.js Configuration ---

# Replace with your Google OAuth Client ID and Secret from Google Cloud Console
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE

# The full URL of your application (e.g., http://localhost:3000 or https://yourdomain.com)
# THIS MUST EXACTLY MATCH THE URL YOU USE IN YOUR BROWSER.
# Incorrect configuration is a common cause of NextAuth CLIENT_FETCH_ERROR.
NEXTAUTH_URL=http://localhost:9002 # Adjust port if different for dev

# A random string used to hash tokens, sign cookies, and generate cryptographic keys.
# You can generate one using: openssl rand -base64 32
NEXTAUTH_SECRET=YOUR_NEXTAUTH_SECRET_HERE

# --- Firebase Admin SDK (Server-Side) ---
# These are used by NextAuth callbacks and Server Actions.
# Get these from your Firebase project settings > Service accounts > Generate new private key.
FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL=your-service-account-email@your-project-id.iam.gserviceaccount.com
# The private key string, including "-----BEGIN PRIVATE KEY-----" and "-----END PRIVATE KEY-----".
# IMPORTANT: In .env.local, newlines (\n) in the key MUST be escaped as \\n.
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\\nYOUR_PRIVATE_KEY_CONTENT_WITH_ESCAPED_NEWLINES\\n-----END PRIVATE KEY-----\\n"

# --- Firebase Client SDK (Client-Side/Browser) ---
# Get these from your Firebase project settings > General > Your apps > Web app > SDK setup and configuration.
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_CLIENT_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID # Can be same as server-side
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_APP_ID
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-YOUR_MEASUREMENT_ID # Optional, for Analytics

# --- Application Specific ---
# Email for the default admin user (used in auth logic if needed)
ADMIN_EMAIL=your_admin_email@example.com

# Secret token for securing CRON job endpoints (if any)
CRON_SECRET_TOKEN=YOUR_SECURE_RANDOM_CRON_TOKEN

```

### Important Notes on Environment Variables:

*   Replace all `YOUR_..._HERE` placeholders with your actual credentials and values.
*   **`GOOGLE_..._API_KEY`s**: Ensure the respective APIs (Elevation, Maps JavaScript, Directions) are enabled in your Google Cloud Console for the project associated with these keys. Apply appropriate restrictions (e.g., API restrictions, HTTP referrers for client-side keys).
*   **`NEXTAUTH_URL`**: Critical for NextAuth.js. It must exactly match how you access the app. For local development, if `npm run dev` runs on port 9002, it should be `http://localhost:9002`. For production, it's your production URL (e.g., `https://your-app.com`).
*   **`FIREBASE_PRIVATE_KEY`**: The private key should be the full multi-line string. When placing it in `.env.local`, ensure that actual newline characters within the key are represented as `\\n`.
*   **Security**: `.env.local` is ignored by Git by default (as it should be, to protect your keys). Ensure it's listed in your `.gitignore` file.
*   **Firebase Admin vs. Client SDK**:
    *   `firebaseAdmin.ts` (using `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_CLIENT_EMAIL`) is for **server-side code only** (Server Actions, API routes). **Never import `firebaseAdmin.ts` or `firebase-admin` into client-side components.** Doing so will cause build errors like "Module not found: Can't resolve 'child_process'".
    *   `firebaseClient.ts` (using `NEXT_PUBLIC_FIREBASE_...` variables) is for client-side Firebase interactions.

### Troubleshooting Common Errors:

*   **NextAuth `CLIENT_FETCH_ERROR` ("Unexpected token '<', \"<!DOCTYPE \"... is not valid JSON")**:
    1.  **Check `NEXTAUTH_URL`**: Is it *exactly* correct in `.env.local`? (e.g., `http://localhost:9002` vs `http://127.0.0.1:9002`).
    2.  **Google OAuth Redirect URIs**: In Google Cloud Console, ensure your "Authorized redirect URIs" for your OAuth 2.0 Client ID include `${NEXTAUTH_URL}/api/auth/callback/google`.
    3.  **Firebase Admin SDK Credentials**: Incorrect `FIREBASE_PROJECT_ID`, `FIREBASE_PRIVATE_KEY`, or `FIREBASE_CLIENT_EMAIL` can cause server-side errors in NextAuth callbacks, leading to HTML error pages being returned instead of JSON. Check server logs for `FIREBASE_ADMIN_SDK_INIT_ERROR`.
    4.  **`NEXTAUTH_SECRET`**: Ensure it's set.
*   **"Module not found: Can't resolve 'child_process'" (or 'fs', 'os', etc.)**:
    *   This means a server-only Node.js module or a library like `firebase-admin` (which uses such modules) is being imported into your client-side JavaScript bundle.
    *   **DO NOT** import `src/lib/firebaseAdmin.ts` or any file that imports `firebase-admin` into your React components, pages (unless it's a server-only part of an App Router component), or shared utilities that run on the client.
    *   Use Server Actions or API Routes for all operations requiring `firebase-admin`.
    *   The `next.config.ts` attempts to provide fallbacks for these modules, but the root cause is an incorrect import.

You can obtain API keys and configure services from the [Google Cloud Console](https://console.cloud.google.com/) and [Firebase Console](https://console.firebase.google.com/).

```
