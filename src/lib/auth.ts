import crypto from "crypto";
import { cookies } from "next/headers";
import { SafeUser, User } from "./types";

const SECRET_KEY =
  process.env.JWT_SECRET ||
  "projectalex25-super-secret-production-signing-key-2026";

export const SESSION_COOKIE_NAME = "pa25_session";

export function hashPassword(password: string): string {
  const salt = "pa25_salt_v1";
  return crypto
    .pbkdf2Sync(password, salt, 10000, 64, "sha512")
    .toString("hex");
}

export function verifyPassword(password: string, hash: string): boolean {
  const computed = hashPassword(password);
  try {
    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(hash, "hex")
    );
  } catch {
    return false;
  }
}

export interface SessionPayload {
  userId: string;
  email: string;
  name: string;
  handle: string;
  exp: number;
}

export function signSessionToken(payload: Omit<SessionPayload, "exp">): string {
  const fullPayload: SessionPayload = {
    ...payload,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };
  const data = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET_KEY)
    .update(data)
    .digest("base64url");
  return `${data}.${signature}`;
}

export function verifySessionToken(token: string): SessionPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 2) return null;
    const [data, signature] = parts;
    const expectedSig = crypto
      .createHmac("sha256", SECRET_KEY)
      .update(data)
      .digest("base64url");
    if (signature !== expectedSig) return null;
    const payload: SessionPayload = JSON.parse(
      Buffer.from(data, "base64url").toString("utf8")
    );
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function sanitizeUser(user: User): SafeUser {
  const { passwordHash: _unused, ...safe } = user;
  void _unused;
  return safe;
}

export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifySessionToken(token);
  } catch {
    return null;
  }
}
