// src/app/terms/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { PageShell } from "@/components/layout/page-shell";

export const metadata: Metadata = {
    title: "Terms of Service — FindLOS",
    description:
        "Terms of Service for FindLOS, the Line-of-Sight feasibility analysis platform by Nav Wireless Technologies Pvt. Ltd.",
};

export default function TermsPage() {
    return (
        <PageShell
            maxWidth="md"
            breadcrumbs={[
                { label: "Home", href: "/" },
                { label: "Terms of Service" },
            ]}
        >
            <article className="prose prose-invert prose-sm sm:prose-base max-w-none prose-headings:text-text-brand-primary prose-p:text-text-brand-secondary prose-li:text-text-brand-secondary prose-strong:text-text-brand-primary prose-a:text-brand-400 hover:prose-a:text-brand-300">
                <h1 className="text-3xl sm:text-4xl font-bold tracking-tight !mb-2">
                    Terms of Service
                </h1>
                <p className="text-sm !text-text-brand-disabled !mt-0 !mb-8">
                    Last updated: March 29, 2026
                </p>

                {/* 1 */}
                <h2>1. Acceptance of Terms</h2>
                <p>
                    By accessing or using FindLOS (&quot;the Service&quot;), available at{" "}
                    <a href="https://findlos.com" target="_blank" rel="noopener noreferrer">
                        findlos.com
                    </a>
                    , you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you
                    do not agree to these Terms, you must not use the Service.
                </p>

                {/* 2 */}
                <h2>2. Service Description</h2>
                <p>
                    FindLOS is a Line-of-Sight (LOS) feasibility analysis platform
                    developed and operated by{" "}
                    <strong>Nav Wireless Technologies Pvt. Ltd.</strong> The Service
                    provides terrain elevation profile analysis, Fresnel zone clearance
                    calculations, tower height recommendations, and fiber path distance
                    estimations for telecom professionals evaluating FSO, microwave, and
                    other wireless link deployments.
                </p>

                {/* 3 */}
                <h2>3. User Accounts</h2>
                <ul>
                    <li>
                        You must sign in using a valid Google account via OAuth 2.0 to
                        access the Service.
                    </li>
                    <li>
                        All new accounts are subject to an approval process. An
                        administrator must approve your account before you can use the
                        analysis tools.
                    </li>
                    <li>
                        We reserve the right to approve, reject, suspend, or terminate
                        any account at our sole discretion, without prior notice or
                        liability.
                    </li>
                    <li>
                        You are responsible for all activity that occurs under your
                        account.
                    </li>
                    <li>
                        You must not share your account access with any other person.
                    </li>
                </ul>

                {/* 4 */}
                <h2>4. Credits &amp; Billing</h2>
                <ul>
                    <li>
                        <strong>Free Tier:</strong> New approved accounts receive 10
                        complimentary analysis credits. Each LOS or fiber path analysis
                        consumes 1 credit.
                    </li>
                    <li>
                        <strong>Pro Plan:</strong> The Pro subscription is available at
                        ₹500/month (inclusive of applicable taxes), billed via Razorpay.
                        Pro subscribers enjoy unlimited analyses for the duration of their
                        active subscription.
                    </li>
                    <li>
                        Pro subscriptions are valid for 30 days from the date of payment
                        and do not auto-renew.
                    </li>
                    <li>
                        <strong>Refunds:</strong> Credits already consumed are
                        non-refundable. For Pro plan refund requests within 48 hours of
                        purchase (with no analyses performed), contact us at the address
                        below.
                    </li>
                    <li>
                        We reserve the right to modify pricing with 30 days advance
                        notice.
                    </li>
                </ul>

                {/* 5 */}
                <h2>5. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul>
                    <li>
                        Use automated scripts, bots, or scrapers to access the Service.
                    </li>
                    <li>
                        Attempt to circumvent rate limits, credit checks, or any security
                        measures.
                    </li>
                    <li>
                        Reverse engineer, decompile, or disassemble any part of the
                        Service.
                    </li>
                    <li>
                        Share, resell, or redistribute analysis results commercially
                        without written permission.
                    </li>
                    <li>
                        Use the Service for any illegal or unauthorized purpose.
                    </li>
                    <li>
                        Overload, disrupt, or interfere with the Service infrastructure.
                    </li>
                </ul>

                {/* 6 */}
                <h2>6. Data Usage</h2>
                <p>
                    By using the Service, you acknowledge that we collect and process
                    the following data:
                </p>
                <ul>
                    <li>
                        <strong>Google account information:</strong> Name, email address,
                        and profile photo (via Google OAuth).
                    </li>
                    <li>
                        <strong>Analysis data:</strong> Geographic coordinates, tower
                        heights, analysis parameters, and results.
                    </li>
                    <li>
                        <strong>Payment information:</strong> Payment processing is
                        handled by Razorpay. We do not store your card details.
                    </li>
                    <li>
                        <strong>Usage data:</strong> Analysis history, credit usage, and
                        login activity.
                    </li>
                </ul>
                <p>
                    For full details, see our{" "}
                    <Link href="/privacy" className="text-brand-400 hover:text-brand-300">
                        Privacy Policy
                    </Link>
                    .
                </p>

                {/* 7 */}
                <h2>7. Intellectual Property</h2>
                <p>
                    FindLOS, including its source code, design, algorithms, branding,
                    and documentation, is the intellectual property of{" "}
                    <strong>Nav Wireless Technologies Pvt. Ltd.</strong> All rights are
                    reserved. You may not copy, modify, or distribute any part of the
                    Service without explicit written consent.
                </p>

                {/* 8 */}
                <h2>8. Disclaimer of Warranties</h2>
                <p>
                    The Service is provided <strong>&quot;as is&quot;</strong> and{" "}
                    <strong>&quot;as available&quot;</strong> without warranties of any kind,
                    whether express or implied. Analysis results are{" "}
                    <strong>estimates based on available terrain data</strong> and are
                    not substitutes for professional field surveys, site visits, or
                    engineering assessments. Elevation data is sourced from third-party
                    APIs (Google Maps Elevation API) and may contain inaccuracies.
                </p>

                {/* 9 */}
                <h2>9. Limitation of Liability</h2>
                <p>
                    To the maximum extent permitted by law, Nav Wireless Technologies
                    Pvt. Ltd. and its officers, directors, employees, and agents shall
                    not be liable for any indirect, incidental, special, consequential,
                    or punitive damages arising from:
                </p>
                <ul>
                    <li>
                        Any decisions made based on analysis results provided by the
                        Service.
                    </li>
                    <li>
                        Inaccuracies in elevation data, terrain models, or clearance
                        calculations.
                    </li>
                    <li>Service downtime, data loss, or unauthorized access.</li>
                    <li>
                        Any third-party services (Google Maps, Razorpay) used by the
                        platform.
                    </li>
                </ul>

                {/* 10 */}
                <h2>10. Modifications to Terms</h2>
                <p>
                    We may update these Terms at any time. Changes will be posted on
                    this page with an updated &quot;Last updated&quot; date. Your continued use
                    of the Service after changes are posted constitutes acceptance of
                    the revised Terms. For material changes, we will make reasonable
                    efforts to notify users via the platform.
                </p>

                {/* 11 */}
                <h2>11. Governing Law</h2>
                <p>
                    These Terms are governed by and construed in accordance with the
                    laws of India. Any disputes shall be subject to the exclusive
                    jurisdiction of the courts in Ahmedabad, Gujarat, India.
                </p>

                {/* 12 */}
                <h2>12. Contact Information</h2>
                <p>
                    If you have questions about these Terms, please contact us:
                </p>
                <ul>
                    <li>
                        <strong>Company:</strong> Nav Wireless Technologies Pvt. Ltd.
                    </li>
                    <li>
                        <strong>Product:</strong> FindLOS — Line-of-Sight Feasibility
                        Analyzer
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
            </article>
        </PageShell>
    );
}