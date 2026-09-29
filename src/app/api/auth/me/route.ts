import { NextRequest, NextResponse } from "next/server";
import {
  getSessionFromCookies,
  hashPassword,
  sanitizeUser,
  SESSION_COOKIE_NAME,
  signSessionToken,
} from "@/lib/auth";
import { ensureSessionUser, readDb, writeDb } from "@/lib/db";

export async function GET() {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
  const user = ensureSessionUser(session);
  return NextResponse.json({ user: sanitizeUser(user) });
}

export async function PATCH(req: NextRequest) {
  const session = await getSessionFromCookies();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    ensureSessionUser(session);
    const db = readDb();
    const userIndex = db.users.findIndex((u) => u.id === session.userId);
    if (userIndex === -1) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = db.users[userIndex];
    if (typeof body.name === "string" && body.name.trim()) {
      user.name = body.name.trim();
    }
    if (typeof body.handle === "string" && body.handle.trim()) {
      user.handle = body.handle
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, "");
    }
    if (typeof body.bio === "string") {
      user.bio = body.bio.trim();
    }
    if (body.primaryPillar) {
      user.primaryPillar = body.primaryPillar;
    }
    if (typeof body.dailyFocusTarget === "number") {
      user.dailyFocusTarget = Math.max(15, Math.min(480, body.dailyFocusTarget));
    }
    if (typeof body.avatarColor === "string" && body.avatarColor) {
      user.avatarColor = body.avatarColor;
    }
    if (typeof body.newPassword === "string" && body.newPassword.length >= 6) {
      user.passwordHash = hashPassword(body.newPassword);
    }

    writeDb(db);

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
    });

    const response = NextResponse.json({
      user: sanitizeUser(user),
      message: "Profile updated successfully.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
