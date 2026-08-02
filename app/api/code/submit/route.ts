import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { submitCodeChallenge } from "@/lib/actions/gamification";

/**
 * POST /api/code/submit
 * Validates a code submission against test cases (client already ran Pyodide)
 * Receives results from the client and saves the submission.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const {
      challengeId,
      code,
      language,
      passedTests,
      totalTests,
      executionTime,
    } = await req.json();

    if (!challengeId || !code) {
      return NextResponse.json({ error: "Eksik veri" }, { status: 400 });
    }

    const result = await submitCodeChallenge(
      challengeId,
      code,
      language ?? "python",
      passedTests ?? 0,
      totalTests ?? 0,
      executionTime ?? 0
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Code submit error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

/**
 * GET /api/code/challenge/[challengeId]
 * Returns challenge details + visible test cases
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const challengeId = searchParams.get("challengeId");

  if (!challengeId) {
    return NextResponse.json({ error: "Challenge ID gerekli" }, { status: 400 });
  }

  try {
    const challenge = await db.codeChallenge.findUnique({
      where: { id: challengeId },
      include: {
        testCases: {
          where: { isHidden: false },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!challenge) {
      return NextResponse.json({ error: "Zorluk bulunamadı" }, { status: 404 });
    }

    return NextResponse.json(challenge);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
