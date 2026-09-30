import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, sanitizeUser } from "@/lib/auth";
import { ensureSessionUser, readDb, writeDb } from "@/lib/db";
import { calculateLevel, getIsoDateOffset } from "@/lib/seed";
import { JournalEntry, Pillar } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = ensureSessionUser(session);
    const db = readDb();

    const title = (body.title || "").trim() || "Daily Stoic Reflection";
    const winOfTheDay = (body.winOfTheDay || "").trim();
    const lessonLearned = (body.lessonLearned || "").trim();
    const gratitude = (body.gratitude || "").trim();
    const content = (body.content || "").trim();

    if (!winOfTheDay && !content && !lessonLearned) {
      return NextResponse.json(
        { error: "Please share at least a daily win, lesson, or reflection." },
        { status: 400 }
      );
    }

    const pillar: Pillar = body.pillar || "Mind";
    const mood = Math.min(5, Math.max(1, Number(body.mood) || 4)) as 1 | 2 | 3 | 4 | 5;
    const energy = Math.min(5, Math.max(1, Number(body.energy) || 4)) as 1 | 2 | 3 | 4 | 5;
    const tags: string[] = Array.isArray(body.tags)
      ? body.tags.filter((t: string) => typeof t === "string" && t.trim())
      : [pillar, "Reflection"];

    const entry: JournalEntry = {
      id: `jrn_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      date: getIsoDateOffset(0),
      title,
      winOfTheDay,
      lessonLearned,
      gratitude,
      content,
      mood,
      energy,
      pillar,
      tags,
      createdAt: new Date().toISOString(),
    };

    db.journals.unshift(entry);

    const dbUser = db.users.find((u) => u.id === user.id)!;
    const xpEarned = 40;
    dbUser.xp += xpEarned;
    dbUser.level = calculateLevel(dbUser.xp);

    writeDb(db);

    return NextResponse.json({
      entry,
      user: sanitizeUser(dbUser),
      xpEarned,
    });
  } catch (error) {
    console.error("Create journal error:", error);
    return NextResponse.json(
      { error: "Failed to save journal entry." },
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
    return NextResponse.json({ error: "Journal ID required" }, { status: 400 });
  }

  const user = ensureSessionUser(session);
  const db = readDb();
  db.journals = db.journals.filter((j) => !(j.id === id && j.userId === user.id));
  writeDb(db);

  return NextResponse.json({ deleted: id });
}
