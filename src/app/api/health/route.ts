import { NextResponse } from "next/server";
import { readDb } from "@/lib/db";

export async function GET() {
  const db = readDb();
  return NextResponse.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    service: "ProjectAlex25 Evolution OS v2.0",
    stats: {
      users: db.users.length,
      habits: db.habits.length,
      goals: db.goals.length,
      journals: db.journals.length,
      focusSessions: db.focusSessions.length,
      challenges: db.challenges.length,
      posts: db.posts.length,
    },
    env: process.env.VERCEL ? "vercel" : "local",
    storage: process.env.VERCEL ? "/tmp/projectalex25.db.json (ephemeral) + memory fallback" : "data/projectalex25.db.json",
  });
}
