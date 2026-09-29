import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, sanitizeUser } from "@/lib/auth";
import { ensureSessionUser, readDb, writeDb } from "@/lib/db";
import { calculateLevel } from "@/lib/seed";
import { FocusSession, Pillar } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = ensureSessionUser(session);
    const db = readDb();

    const taskTitle = (body.taskTitle || "").trim() || "Deep Work Focus Block";
    const pillar: Pillar = body.pillar || "Craft";
    const durationMinutes = Math.max(1, Math.min(240, Number(body.durationMinutes) || 25));
    const xpEarned = durationMinutes * 2;

    const focusSession: FocusSession = {
      id: `foc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      taskTitle,
      pillar,
      durationMinutes,
      xpEarned,
      completedAt: new Date().toISOString(),
    };

    db.focusSessions.unshift(focusSession);

    const dbUser = db.users.find((u) => u.id === user.id)!;
    dbUser.focusMinutesTotal += durationMinutes;
    dbUser.xp += xpEarned;
    dbUser.level = calculateLevel(dbUser.xp);

    writeDb(db);

    return NextResponse.json({
      focusSession,
      user: sanitizeUser(dbUser),
      xpEarned,
    });
  } catch (error) {
    console.error("Focus session error:", error);
    return NextResponse.json(
      { error: "Failed to log focus session." },
      { status: 500 }
    );
  }
}
