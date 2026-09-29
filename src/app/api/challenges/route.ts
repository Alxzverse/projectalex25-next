import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, sanitizeUser } from "@/lib/auth";
import { ensureSessionUser, readDb, writeDb } from "@/lib/db";
import { calculateLevel, getIsoDateOffset } from "@/lib/seed";
import { ChallengeProtocol, Pillar } from "@/lib/types";

export async function POST(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const user = ensureSessionUser(session);
    const db = readDb();
    const dbUser = db.users.find((u) => u.id === user.id)!;

    if (body.action === "create") {
      const title = (body.title || "").trim();
      if (!title) {
        return NextResponse.json(
          { error: "Protocol title is required." },
          { status: 400 }
        );
      }
      const durationDays = Math.max(7, Math.min(90, Number(body.durationDays) || 25));
      const pillar: Pillar = body.pillar || "Mind";
      const difficulty = body.difficulty || "Vanguard";
      const rules: string[] = Array.isArray(body.rules)
        ? body.rules.filter((r: string) => typeof r === "string" && r.trim())
        : ["Execute core daily habit block", "Zero missed days"];

      const newChallenge: ChallengeProtocol = {
        id: `chl_${Date.now()}`,
        title,
        subtitle: (body.subtitle || `${durationDays}-Day High-Performance Protocol`).trim(),
        description: (body.description || "Custom community protocol built on ProjectAlex25.").trim(),
        durationDays,
        pillar,
        difficulty,
        xpReward: durationDays * 50,
        rules,
        participantsCount: 1,
        userProgress: [
          {
            userId: user.id,
            completedDays: [1],
            startedAt: getIsoDateOffset(0),
          },
        ],
      };

      db.challenges.unshift(newChallenge);
      dbUser.xp += 100;
      dbUser.level = calculateLevel(dbUser.xp);
      writeDb(db);

      return NextResponse.json({
        challenges: db.challenges,
        user: sanitizeUser(dbUser),
        xpDelta: 100,
      });
    }

    const challenge = db.challenges.find((c) => c.id === body.challengeId);
    if (!challenge) {
      return NextResponse.json(
        { error: "Challenge not found." },
        { status: 404 }
      );
    }

    let progress = challenge.userProgress.find((p) => p.userId === user.id);
    let xpDelta = 0;

    if (body.action === "join") {
      if (!progress) {
        progress = {
          userId: user.id,
          completedDays: [],
          startedAt: getIsoDateOffset(0),
        };
        challenge.userProgress.push(progress);
        challenge.participantsCount += 1;
        xpDelta = 50;
      }
    } else if (body.action === "toggleDay") {
      const dayNumber = Number(body.dayNumber);
      if (!progress) {
        progress = {
          userId: user.id,
          completedDays: [],
          startedAt: getIsoDateOffset(0),
        };
        challenge.userProgress.push(progress);
        challenge.participantsCount += 1;
      }

      if (progress.completedDays.includes(dayNumber)) {
        progress.completedDays = progress.completedDays.filter(
          (d) => d !== dayNumber
        );
        xpDelta = -50;
      } else {
        progress.completedDays.push(dayNumber);
        progress.completedDays.sort((a, b) => a - b);
        xpDelta = 50;
        if (progress.completedDays.length === challenge.durationDays) {
          xpDelta += 300;
          if (!dbUser.badges.includes(challenge.title)) {
            dbUser.badges.push(challenge.title);
          }
        }
      }
    }

    if (xpDelta !== 0) {
      dbUser.xp = Math.max(0, dbUser.xp + xpDelta);
      dbUser.level = calculateLevel(dbUser.xp);
    }

    writeDb(db);

    return NextResponse.json({
      challenges: db.challenges,
      user: sanitizeUser(dbUser),
      xpDelta,
    });
  } catch (error) {
    console.error("Challenge error:", error);
    return NextResponse.json(
      { error: "Failed to update challenge." },
      { status: 500 }
    );
  }
}
