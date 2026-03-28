// src/app/api/credits/deduct/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { checkAndDeductCredit, logAnalysisHistory } from "@/lib/credits";
import { checkRateLimit, rateLimitResponse } from "@/lib/rate-limiter";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Rate limiting (same as analysis)
    const rateCheck = checkRateLimit(session.user.id, "analysis");
    if (!rateCheck.allowed) {
      return rateLimitResponse(rateCheck);
    }

    const body = await request.json();
    const analysisType = body.analysisType || "fiber_path";

    // Validate analysis type
    const validTypes = ["fiber_path", "single_los", "bulk_los"];
    if (!validTypes.includes(analysisType)) {
      return NextResponse.json(
        { error: "Invalid analysis type" },
        { status: 400 }
      );
    }

    const creditResult = await checkAndDeductCredit(
      session.user.id,
      analysisType
    );

    if (!creditResult.success) {
      return NextResponse.json(
        { success: false, error: creditResult.error || "Credit check failed." },
        { status: 403 }
      );
    }

    // Log analysis history for fiber path
    if (analysisType === "fiber_path") {
      try {
        await logAnalysisHistory(
          session.user.id,
          session.user.email,
          "fiber_path",
          { name: "Fiber Point A", lat: 0, lng: 0, towerHeight: 0 },
          { name: "Fiber Point B", lat: 0, lng: 0, towerHeight: 0 },
          {
            isFeasible: true,
            distance: 0,
            minClearance: 0,
            additionalHeightNeeded: 0,
          }
        );
      } catch (logErr) {
        console.error(
          "WARNING: Failed to log fiber analysis history:",
          logErr
        );
      }
    }

    return NextResponse.json({
      success: true,
      creditsRemaining: creditResult.creditsRemaining ?? 0,
    });
  } catch (err) {
    console.error("CREDIT_DEDUCT_ERROR:", err);
    const message =
      err instanceof Error ? err.message : "Credit deduction failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}