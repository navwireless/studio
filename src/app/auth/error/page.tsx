// src/app/auth/error/page.tsx
"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import appLogo from "@/app/Favicon/apple-touch-icon.png";

const ERROR_MESSAGES: Record<string, string> = {
    Configuration:
        "There is a problem with the server configuration. Please contact support.",
    AccessDenied:
        "Your account access has been denied. This may mean your account is suspended or rejected. Please contact support.",
    Verification:
        "The verification link has expired or has already been used.",
    OAuthSignin:
        "Could not initiate Google sign-in. Please check your internet connection and try again.",
    OAuthCallback:
        "There was an error during the authentication process. Please try again.",
    OAuthCreateAccount:
        "Could not create your account. Please try again or contact support.",
    EmailCreateAccount:
        "Could not create your account with this email. Please try again.",
    Callback:
        "An error occurred during sign-in. Please try again.",
    OAuthAccountNotLinked:
        "This email is already associated with another sign-in method.",
    SessionRequired:
        "You need to be signed in to access this page.",
    Default:
        "An unexpected authentication error occurred. Please try again.",
};

function ErrorContent() {
    const searchParams = useSearchParams();
    const errorCode = searchParams.get("error") || "Default";
    const errorMessage =
        ERROR_MESSAGES[errorCode] || ERROR_MESSAGES["Default"];

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4">
            <div className="w-full max-w-md">
                <div className="flex flex-col items-center mb-8">
                    <Image
                        src={appLogo}
                        alt="FindLOS Logo"
                        width={64}
                        height={64}
                        className="bg-white rounded-2xl p-1.5 shadow-lg mb-4"
                    />
                </div>

                <Card className="bg-slate-900/80 border-white/10 backdrop-blur-sm">
                    <CardHeader className="text-center pb-4">
                        <div className="flex justify-center mb-3">
                            <AlertTriangle className="h-10 w-10 text-amber-400" />
                        </div>
                        <CardTitle className="text-xl text-white">
                            Authentication Error
                        </CardTitle>
                        <CardDescription className="text-white/50">
                            {errorMessage}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {errorCode !== "Default" && (
                            <p className="text-xs text-center text-white/20">
                                Error code: {errorCode}
                            </p>
                        )}
                        <div className="flex flex-col gap-2">
                            <Link href="/auth/signin" className="w-full">
                                <Button className="w-full bg-teal-600 hover:bg-teal-700 text-white">
                                    Try Again
                                </Button>
                            </Link>
                            <Link href="/" className="w-full">
                                <Button
                                    variant="ghost"
                                    className="w-full text-white/50 hover:text-white"
                                >
                                    Go to Homepage
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>

                <p className="text-center text-xs text-white/20 mt-6">
                    If this problem persists, contact support.
                    <br />
                    Nav Wireless Technologies Pvt. Ltd.
                </p>
            </div>
        </div>
    );
}

export default function AuthErrorPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-background">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-500 border-t-transparent" />
                </div>
            }
        >
            <ErrorContent />
        </Suspense>
    );
}