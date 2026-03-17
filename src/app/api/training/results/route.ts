import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// Admin password — protects the GET endpoint (reading results)
const ADMIN_PASSWORD = process.env.TRAINING_ADMIN_PASSWORD;

// ─── POST /api/training/results — Save a training result ───────
// Called by the training HTML files when an agent finishes training.
// No auth needed — anyone with the training link can submit results.

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    const {
      agentName,
      module,
      language,
      finalScore,
      passed,
      totalCorrect,
      totalChecks,
      totalSeconds,
      avgSeconds,
      scenarioCount,
      trapsFell,
      trapsTotal,
      detailsJson,
    } = body;

    if (!agentName || typeof agentName !== "string" || agentName.trim().length < 2) {
      return NextResponse.json({ error: "Agent name required" }, { status: 400 });
    }

    if (!module || (module !== "status" && module !== "confirmation")) {
      return NextResponse.json({ error: "Module must be 'status' or 'confirmation'" }, { status: 400 });
    }

    if (typeof finalScore !== "number" || finalScore < 0 || finalScore > 100) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    // Save to database
    const result = await db.trainingResult.create({
      data: {
        agentName: agentName.trim(),
        module,
        language: language || "fr",
        finalScore: Math.round(finalScore),
        passed: Boolean(passed),
        totalCorrect: Number(totalCorrect) || 0,
        totalChecks: Number(totalChecks) || 0,
        totalSeconds: Number(totalSeconds) || 0,
        avgSeconds: Number(avgSeconds) || 0,
        scenarioCount: Number(scenarioCount) || 0,
        trapsFell: Number(trapsFell) || 0,
        trapsTotal: Number(trapsTotal) || 0,
        detailsJson: detailsJson || null,
      },
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error("POST /api/training/results error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to save result", detail: msg }, { status: 500 });
  }
}

// ─── GET /api/training/results — Read all results (admin only) ──
// The admin dashboard calls this to display training results.
// Requires X-Admin-Key header matching TRAINING_ADMIN_PASSWORD.

export async function GET(request: NextRequest) {
  // Check admin password
  if (!ADMIN_PASSWORD) {
    console.error("TRAINING_ADMIN_PASSWORD env var not set");
    return NextResponse.json({ error: "Admin access not configured" }, { status: 401 });
  }

  const key = request.headers.get("x-admin-key");
  if (key !== ADMIN_PASSWORD) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  try {
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    console.log("DB URL prefix:", dbUrl.substring(0, 30) + "...");

    const results = await db.trainingResult.findMany({
      orderBy: { createdAt: "desc" },
    });

    // Transform to match the format the admin dashboard expects
    const formatted = results.map((r) => ({
      agentName: r.agentName,
      module: r.module,
      language: r.language,
      finalScore: r.finalScore,
      passed: r.passed,
      totalCorrect: r.totalCorrect,
      totalChecks: r.totalChecks,
      totalSeconds: r.totalSeconds,
      avgSeconds: r.avgSeconds,
      scenarioCount: r.scenarioCount,
      trapsFell: r.trapsFell,
      trapsTotal: r.trapsTotal,
      detailsJson: r.detailsJson,
      timestamp: r.createdAt.toISOString(),
    }));

    return NextResponse.json({ results: formatted });
  } catch (error) {
    console.error("GET /api/training/results error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    const dbUrl = process.env.DATABASE_URL || "NOT SET";
    const urlPreview = dbUrl === "NOT SET" ? "NOT SET" : dbUrl.substring(0, 15) + "..." + dbUrl.substring(dbUrl.length - 20);
    return NextResponse.json({ error: "Failed to load results", detail: msg, dbUrlPreview: urlPreview }, { status: 500 });
  }
}
