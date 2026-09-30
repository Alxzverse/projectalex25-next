import { NextResponse } from "next/server";
import { getSessionFromCookies, sanitizeUser } from "@/lib/auth";
import { ensureSessionUser, readDb } from "@/lib/db";
import { Pillar } from "@/lib/types";

const PILLARS: Pillar[] = ["Mind", "Body", "Craft", "Wealth", "Spirit"];

export async function GET() {
  const session = await getSessionFromCookies();
  const db = readDb();

  const leaderboard = [...db.users]
    .sort((a, b) => b.xp - a.xp)
    .slice(0, 10)
    .map((u, idx) => ({
      rank: idx + 1,
      id: u.id,
      name: u.name,
      handle: u.handle,
      avatarColor: u.avatarColor,
      primaryPillar: u.primaryPillar,
      xp: u.xp,
      level: u.level,
      streak: u.streak,
      focusMinutesTotal: u.focusMinutesTotal,
      badges: u.badges,
    }));

  if (!session) {
    return NextResponse.json({
      authenticated: false,
      user: null,
      leaderboard,
      challenges: db.challenges,
      posts: db.posts.slice(0, 10),
    });
  }

  const user = ensureSessionUser(session);
  const freshDb = readDb();

  const userHabits = freshDb.habits.filter((h) => h.userId === user.id);
  const userGoals = freshDb.goals.filter((g) => g.userId === user.id);
  const userJournals = freshDb.journals
    .filter((j) => j.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const userFocusSessions = freshDb.focusSessions
    .filter((f) => f.userId === user.id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));

  // Calculate 5-Pillar mastery scores (0-100)
  const pillarScores: Record<Pillar, number> = {
    Mind: 45,
    Body: 45,
    Craft: 45,
    Wealth: 45,
    Spirit: 45,
  };

  for (const pillar of PILLARS) {
    const habitCompletions = userHabits
      .filter((h) => h.pillar === pillar)
      .reduce((acc, h) => acc + h.completedDates.length * 8, 0);
    const goalProgress = userGoals
      .filter((g) => g.pillar === pillar)
      .reduce((acc, g) => acc + Math.round(g.progress * 0.35), 0);
    const focusBoost = userFocusSessions
      .filter((f) => f.pillar === pillar)
      .reduce((acc, f) => acc + Math.round(f.durationMinutes * 0.25), 0);
    pillarScores[pillar] = Math.min(
      100,
      30 + habitCompletions + goalProgress + focusBoost
    );
  }

  return NextResponse.json({
    authenticated: true,
    user: sanitizeUser(user),
    habits: userHabits,
    goals: userGoals,
    journals: userJournals,
    focusSessions: userFocusSessions,
    challenges: freshDb.challenges,
    posts: freshDb.posts,
    leaderboard,
    pillarScores,
  });
}
