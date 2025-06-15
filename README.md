
# Firebase Studio

This is a NextJS starter in Firebase Studio.

To get started, take a look at src/app/page.tsx.

## Environment Variables

This application requires certain environment variables to be set for full functionality, particularly for accessing Google Cloud services.

Create a `.env.local` file in the root of your project and add the following variables:

```plaintext
# For Google Elevation API (used in server actions for LOS calculations)
GOOGLE_ELEVATION_API_KEY=YOUR_GOOGLE_ELEVATION_API_KEY_HERE

# For Google Maps JavaScript API (used for client-side maps)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_GOOGLE_MAPS_JS_API_KEY_HERE
```

**Important Notes:**

*   Replace `YOUR_GOOGLE_ELEVATION_API_KEY_HERE` and `YOUR_GOOGLE_MAPS_JS_API_KEY_HERE` with your actual API keys.
*   The `GOOGLE_ELEVATION_API_KEY` is used server-side and should NOT be prefixed with `NEXT_PUBLIC_`. Ensure it has appropriate restrictions in your Google Cloud Console (e.g., restrict to your server's IP if possible, and enable only the Elevation API).
*   The `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` is exposed to the client-side and **must** be prefixed with `NEXT_PUBLIC_`. Ensure it has appropriate restrictions in your Google Cloud Console (e.g., HTTP referrers, and enable only the Maps JavaScript API).
*   `.env.local` is ignored by Git by default (as it should be, to protect your keys). Ensure it's listed in your `.gitignore` file.

You can obtain these API keys from the [Google Cloud Console](https://console.cloud.google.com/). You'll need to enable the "Elevation API" and "Maps JavaScript API" for your project and set up billing.
