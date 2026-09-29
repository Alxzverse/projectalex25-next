import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/db";
import {
  sanitizeUser,
  SESSION_COOKIE_NAME,
  signSessionToken,
  verifyPassword,
} from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const db = readDb();

    let user;
    if (body.isDemo) {
      user = db.users.find((u) => u.email === "alex@projectalex25.com") || db.users[0];
    } else {
      const email = (body.email || "").trim().toLowerCase();
      const password = body.password || "";

      if (!email || !password) {
        return NextResponse.json(
          { error: "Email and password are required." },
          { status: 400 }
        );
      }

      user = db.users.find((u) => u.email.toLowerCase() === email);
      if (!user || !verifyPassword(password, user.passwordHash)) {
        return NextResponse.json(
          { error: "Invalid email or password. (Tip: Try Demo Login or alex@projectalex25.com / password123)" },
          { status: 401 }
        );
      }
    }

    const token = signSessionToken({
      userId: user.id,
      email: user.email,
      name: user.name,
      handle: user.handle,
    });

    const response = NextResponse.json({
      user: sanitizeUser(user),
      message: "Signed in successfully.",
    });

    response.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Authentication failed." },
      { status: 500 }
    );
  }
}
