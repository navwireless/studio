// src/app/privacy/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
    title: "Privacy Policy — FindLOS",
    description:
        "Privacy Policy for FindLOS, the Line-of-Sight feasibility analysis platform by Nav Wireless Technologies Pvt. Ltd.",
};

export default function PrivacyPage() {
    return (
        <PageShell
            maxWidth="md"
            breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Privacy Policy" },
            ]}
        >
            <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-text-brand-primary prose-p:text-text-brand-secondary prose-li:text-text-brand-secondary prose-strong:text-text-brand-primary prose-a:text-brand-400 hover:prose-a:text-brand-300">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight !mb-2">
                    Privacy Policy
                </h1>
                <p className="text-sm !text-text-brand-disabled !mt-0 !mb-8">
                    Last updated: March 29, 2026
                </p>

                <p>
                    Nav Wireless Technologies Pvt. Ltd. (&quot;we&quot;, &quot;us&quot;, or &quot;our&quot;)
                    operates FindLOS at{" "}
                    <a href="https://findlos.com" target="_blank" rel="noopener noreferrer">
                        findlos.com
                    </a>
                    . This Privacy Policy explains how we collect, use, store, and
                    protect your information when you use our Service.
                </p>

                {/* 1 */}
                <h2>1. Information We Collect</h2>

                <h3>1.1 Google Account Information</h3>
                <p>
                    When you sign in with Google OAuth, we receive and store your:
                </p>
                <ul>
                    <li>Name (display name)</li>
                    <li>Email address</li>
                    <li>Profile photo URL</li>
                    <li>Google account identifier</li>
                </ul>

                <h3>1.2 Analysis Data</h3>
                <p>When you perform analyses, we store:</p>
                <ul>
                    <li>
                        Geographic coordinates (latitude and longitude) of analysis
                        points
                    </li>
                    <li>Tower height parameters</li>
                    <li>
                        Analysis results (feasibility, distance, clearance values)
                    </li>
                    <li>Timestamps of analyses performed</li>
                </ul>

                <h3>1.3 Payment Information</h3>
                <p>
                    Payment processing is handled entirely by{" "}
                    <strong>Razorpay</strong>, a PCI-DSS compliant payment processor.
                    We <strong>do not</strong> store, process, or have access to your
                    credit/debit card numbers or banking details. We receive and store
                    only:
                </p>
                <ul>
                    <li>Razorpay payment ID and order ID (transaction references)</li>
                    <li>Payment amount and status</li>
                    <li>Subscription start and end dates</li>
                </ul>

                <h3>1.4 Usage Data</h3>
                <ul>
                    <li>Analysis history and credit usage</li>
                    <li>Login timestamps and IP address (server logs)</li>
                    <li>Feature usage patterns</li>
                </ul>

                {/* 2 */}
                <h2>2. How We Use Your Information</h2>
                <ul>
                    <li>
                        <strong>Provide the Service:</strong> Authenticate your identity,
                        run analyses, generate reports, and manage your credits.
                    </li>
                    <li>
                        <strong>Account management:</strong> Manage approval status,
                        subscription state, and credit balance.
                    </li>
                    <li>
                        <strong>Service improvement:</strong> Analyze aggregate usage
                        patterns to improve features and performance.
                    </li>
                    <li>
                        <strong>Administration:</strong> Admin notifications, user
                        management, and abuse prevention.
                    </li>
                    <li>
                        <strong>Legal compliance:</strong> Respond to legal requests and
                        enforce our Terms of Service.
                    </li>
                </ul>

                {/* 3 */}
                <h2>3. Data Storage &amp; Infrastructure</h2>
                <p>Your data is stored using:</p>
                <ul>
                    <li>
                        <strong>Google Cloud Firestore:</strong> User accounts, analysis
                        history, credit transactions, and subscription records.
                    </li>
                    <li>
                        <strong>Vercel:</strong> Application hosting with edge-optimized
                        delivery.
                    </li>
                </ul>
                <p>
                    All data is stored in secured, access-controlled environments with
                    encryption at rest and in transit (TLS/HTTPS).
                </p>

                {/* 4 */}
                <h2>4. Third-Party Services</h2>
                <p>
                    We use the following third-party services, each with their own
                    privacy policies:
                </p>
                <ul>
                    <li>
                        <strong>Google OAuth 2.0:</strong> For authentication.{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Google Privacy Policy
                        </a>
                    </li>
                    <li>
                        <strong>Google Maps &amp; Elevation API:</strong> For map
                        display and terrain data.{" "}
                        <a
                            href="https://policies.google.com/privacy"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Google Privacy Policy
                        </a>
                    </li>
                    <li>
                        <strong>Razorpay:</strong> For payment processing.{" "}
                        <a
                            href="https://razorpay.com/privacy/"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Razorpay Privacy Policy
                        </a>
                    </li>
                </ul>

                {/* 5 */}
                <h2>5. Data Retention</h2>
                <ul>
                    <li>
                        <strong>Account data:</strong> Retained for as long as your
                        account is active.
                    </li>
                    <li>
                        <strong>Analysis history:</strong> Retained indefinitely for
                        audit and service improvement purposes.
                    </li>
                    <li>
                        <strong>Payment records:</strong> Retained for 7 years for
                        financial compliance.
                    </li>
                    <li>
                        <strong>Server logs:</strong> Retained for up to 90 days.
                    </li>
                </ul>

                {/* 6 */}
                <h2>6. Your Rights</h2>
                <p>You have the right to:</p>
                <ul>
                    <li>
                        <strong>Access your data:</strong> Request a copy of the
                        personal data we hold about you.
                    </li>
                    <li>
                        <strong>Delete your account:</strong> Request account deletion
                        by contacting an administrator. Upon deletion, your personal
                        data will be removed, though anonymized analysis logs may be
                        retained for audit purposes.
                    </li>
                    <li>
                        <strong>Export your data:</strong> Use the dashboard&apos;s CSV
                        export feature to download your analysis history.
                    </li>
                    <li>
                        <strong>Withdraw consent:</strong> Revoke Google OAuth access at
                        any time via your{" "}
                        <a
                            href="https://myaccount.google.com/permissions"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Google Account settings
                        </a>
                        .
                    </li>
                </ul>

                {/* 7 */}
                <h2>7. Cookies &amp; Local Storage</h2>
                <ul>
                    <li>
                        <strong>Session cookies:</strong> Used by NextAuth.js for
                        authentication. These are essential for the Service to function
                        and cannot be disabled.
                    </li>
                    <li>
                        <strong>Local storage:</strong> Used to persist form data,
                        user preferences, and saved analysis links on your device. This
                        data never leaves your browser.
                    </li>
                    <li>
                        <strong>Cookie consent preference:</strong> Stored in local
                        storage to remember your consent choice.
                    </li>
                </ul>

                {/* 8 */}
                <h2>8. Security</h2>
                <p>We implement the following security measures:</p>
                <ul>
                    <li>HTTPS encryption for all communications</li>
                    <li>OAuth 2.0 authentication (no passwords stored)</li>
                    <li>JWT-based session management with signed tokens</li>
                    <li>Server-side rate limiting on critical endpoints</li>
                    <li>
                        Security headers (X-Frame-Options, CSP, HSTS, etc.)
                    </li>
                    <li>Role-based access control for admin functions</li>
                    <li>Atomic Firestore transactions for credit operations</li>
                </ul>
                <p>
                    While we take reasonable measures to protect your data, no method
                    of transmission over the Internet is 100% secure.
                </p>

                {/* 9 */}
                <h2>9. Children&apos;s Privacy</h2>
                <p>
                    FindLOS is not intended for users under the age of 18. We do not
                    knowingly collect personal information from children. If we become
                    aware that we have collected data from a child under 18, we will
                    take steps to delete it promptly.
                </p>

                {/* 10 */}
                <h2>10. Changes to This Policy</h2>
                <p>
                    We may update this Privacy Policy from time to time. Changes will
                    be posted on this page with an updated date. We encourage you to
                    review this policy periodically. Your continued use of the Service
                    after changes constitutes acceptance of the updated policy.
                </p>

                {/* 11 */}
                <h2>11. Contact Us</h2>
                <p>
                    If you have questions or concerns about this Privacy Policy or
                    your data, please contact us:
                </p>
                <ul>
                    <li>
                        <strong>Company:</strong> Nav Wireless Technologies Pvt. Ltd.
                    </li>
                    <li>
                        <strong>Product:</strong> FindLOS
                    </li>
                    <li>
                        <strong>Website:</strong>{" "}
                        <a
                            href="https://findlos.com"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            findlos.com
                        </a>
                    </li>
                    <li>
                        <strong>Developer:</strong> Raj Patel
                    </li>
                </ul>

                <div className="mt-10 pt-6 border-t border-surface-border">
                    <p className="text-sm !text-text-brand-disabled">
                        Also see our{" "}
                        <Link
                            href="/terms"
                            className="text-brand-400 hover:text-brand-300"
                        >
                            Terms of Service
                        </Link>
                        .
                    </p>
                </div>
            </article>
        </PageShell>
    );
}