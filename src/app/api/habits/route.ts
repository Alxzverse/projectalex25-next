import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, sanitizeUser } from "@/lib/auth";
import { ensureSessionUser, readDb, writeDb } from "@/lib/db";
import { calculateLevel, getIsoDateOffset } from "@/lib/seed";
import { Habit, Pillar } from "@/lib/types";

function computeStreak(completedDates: string[]): number {
  const dateSet = new Set(completedDates);
  let streak = 0;
  for (let i = 0; i < 365; i++) {
    const d = getIsoDateOffset(-i);
    if (dateSet.has(d)) {
      streak++;
    } else if (i === 0) {
      // Allow today not yet checked if yesterday was checked
      continue;
    } else {
      break;
    }
  }
  return streak;
}

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = ensureSessionUser(session);
    const db = readDb();

    const title = (body.title || "").trim();
    if (!title) {
      return NextResponse.json(
        { error: "Habit title is required." },
        { status: 400 }
      );
    }

    const pillar: Pillar = body.pillar || "Mind";
    const xpReward = Number(body.xpReward) || 40;
    const targetDaysPerWeek = Number(body.targetDaysPerWeek) || 6;

    const newHabit: Habit = {
      id: `hab_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      title,
      description: (body.description || "").trim(),
      pillar,
      xpReward,
      targetDaysPerWeek,
      completedDates: [],
      streak: 0,
      createdAt: new Date().toISOString(),
    };

    db.habits.unshift(newHabit);
    writeDb(db);

    return NextResponse.json({ habit: newHabit });
  } catch (error) {
    console.error("Create habit error:", error);
    return NextResponse.json(
      { error: "Failed to create habit." },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = ensureSessionUser(session);
    const db = readDb();

    const habitIndex = db.habits.findIndex(
      (h) => h.id === body.habitId && h.userId === user.id
    );
    if (habitIndex === -1) {
      return NextResponse.json({ error: "Habit not found." }, { status: 404 });
    }

    const habit = db.habits[habitIndex];
    const dbUser = db.users.find((u) => u.id === user.id)!;

    let xpDelta = 0;

    if (body.date) {
      const targetDate = body.date as string;
      const exists = habit.completedDates.includes(targetDate);
      if (exists) {
        habit.completedDates = habit.completedDates.filter(
          (d) => d !== targetDate
        );
        xpDelta = -habit.xpReward;
      } else {
        habit.completedDates.push(targetDate);
        xpDelta = habit.xpReward;
      }
      habit.streak = computeStreak(habit.completedDates);

      dbUser.xp = Math.max(0, dbUser.xp + xpDelta);
      dbUser.level = calculateLevel(dbUser.xp);
      dbUser.lastActiveDate = getIsoDateOffset(0);
    }

    if (typeof body.title === "string" && body.title.trim()) {
      habit.title = body.title.trim();
    }
    if (typeof body.description === "string") {
      habit.description = body.description.trim();
    }
    if (body.pillar) {
      habit.pillar = body.pillar;
    }

    writeDb(db);

    return NextResponse.json({
      habit,
      user: sanitizeUser(dbUser),
      xpDelta,
    });
  } catch (error) {
    console.error("Update habit error:", error);
    return NextResponse.json(
      { error: "Failed to update habit." },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Habit ID required" }, { status: 400 });
  }

  const user = ensureSessionUser(session);
  const db = readDb();
  db.habits = db.habits.filter((h) => !(h.id === id && h.userId === user.id));
  writeDb(db);

  return NextResponse.json({ deleted: id });
}
