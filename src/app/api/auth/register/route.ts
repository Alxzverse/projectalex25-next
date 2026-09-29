import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb } from "@/lib/db";
import {
  hashPassword,
  sanitizeUser,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from "@/lib/auth";
import { createStarterDataForNewUser, getIsoDateOffset } from "@/lib/seed";
import { Pillar, User } from "@/lib/types";

const AVATAR_GRADIENTS = [
  "from-amber-400 to-orange-600",
  "from-emerald-400 to-teal-600",
  "from-sky-400 to-indigo-600",
  "from-purple-400 to-fuchsia-600",
  "from-rose-400 to-pink-600",
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const primaryPillar: Pillar = body.primaryPillar || "Craft";

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }

    const db = readDb();
    const existing = db.users.find((u) => u.email.toLowerCase() === email);
    if (existing) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please sign in." },
        { status: 409 }
      );
    }

    const cleanHandleBase =
      (body.handle || name)
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "")
        .slice(0, 14) || "architect";
    const handle = `${cleanHandleBase}${Math.floor(10 + Math.random() * 89)}`;

    const userId = `usr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const randomGradient =
      AVATAR_GRADIENTS[Math.floor(Math.random() * AVATAR_GRADIENTS.length)];

    const newUser: User = {
      id: userId,
      name,
      email,
      handle,
      passwordHash: hashPassword(password),
      avatarColor: randomGradient,
      bio: `Committed to daily excellence across the 5 Pillars. Primary focus: ${primaryPillar}.`,
      primaryPillar,
      xp: 150,
      level: 1,
      streak: 1,
      lastActiveDate: getIsoDateOffset(0),
      focusMinutesTotal: 25,
      dailyFocusTarget: 90,
      joinedAt: getIsoDateOffset(0),
      badges: ["Protocol Initiate", "Day 1 Architect"],
    };

    db.users.push(newUser);

    const starter = createStarterDataForNewUser(userId);
    db.habits.push(...starter.habits);
    db.goals.push(...starter.goals);
    db.journals.push(...starter.journals);
    db.focusSessions.push(...starter.focusSessions);

    // Automatically enroll new user into Protocol 25
    const protocol25 = db.challenges.find((c) => c.id === "chl_protocol25");
    if (protocol25) {
      protocol25.participantsCount += 1;
      protocol25.userProgress.push({
        userId,
        completedDays: [1],
        startedAt: getIsoDateOffset(0),
      });
    }

    writeDb(db);

    const token = signSessionToken({
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      handle: newUser.handle,
    });

    const response = NextResponse.json({
      user: sanitizeUser(newUser),
      message: "Welcome to ProjectAlex25!",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Failed to register account. Please try again." },
      { status: 500 }
    );
  }
}
