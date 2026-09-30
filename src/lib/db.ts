import fs from "fs";
import path from "path";
import { DatabaseSchema, User } from "./types";
import {
  createInitialSeedDatabase,
  createStarterDataForNewUser,
  getIsoDateOffset,
} from "./seed";
import { hashPassword, SessionPayload } from "./auth";

declare global {
  // eslint-disable-next-line no-var
  var __pa25_db_cache: DatabaseSchema | undefined;
}

function getDbFilePath(): string {
  if (process.env.VERCEL) {
    return path.join("/tmp", "projectalex25.db.json");
  }
  const localDir = path.join(process.cwd(), "data");
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    return path.join(localDir, "projectalex25.db.json");
  } catch {
    return path.join("/tmp", "projectalex25.db.json");
  }
}

export function readDb(): DatabaseSchema {
  const filePath = getDbFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      const parsed = JSON.parse(raw) as DatabaseSchema;
      global.__pa25_db_cache = parsed;
      return parsed;
    }
  } catch {
    if (global.__pa25_db_cache) {
      return global.__pa25_db_cache;
    }
  }

  const seeded = createInitialSeedDatabase();
  writeDb(seeded);
  return seeded;
}

export function writeDb(db: DatabaseSchema): void {
  global.__pa25_db_cache = db;
  const filePath = getDbFilePath();
  try {
    fs.writeFileSync(filePath, JSON.stringify(db, null, 2), "utf8");
  } catch {
    // Fallback to /tmp if local write ever fails
    try {
      fs.writeFileSync(
        path.join("/tmp", "projectalex25.db.json"),
        JSON.stringify(db, null, 2),
        "utf8"
      );
    } catch {
      // In-memory global cache remains active
    }
  }
}

/**
 * Ensures that a user from a valid signed JWT cookie exists in the DB
 * (protects against Vercel serverless cold-start /tmp resets).
 */
export function ensureSessionUser(session: SessionPayload): User {
  const db = readDb();
  let user = db.users.find(
    (u) =>
      u.id === session.userId ||
      u.email.toLowerCase() === session.email.toLowerCase()
  );

  if (!user) {
    user = {
      id: session.userId,
      name: session.name,
      email: session.email,
      handle: session.handle,
      passwordHash: hashPassword("restored_session"),
      avatarColor: "from-amber-400 to-orange-600",
      bio: "Architecting daily growth on ProjectAlex25.",
      primaryPillar: "Mind",
      xp: 250,
      level: 1,
      streak: 1,
      lastActiveDate: getIsoDateOffset(0),
      focusMinutesTotal: 25,
      dailyFocusTarget: 90,
      joinedAt: getIsoDateOffset(0),
      badges: ["Protocol Initiate"],
    };
    db.users.push(user);
    const starter = createStarterDataForNewUser(user.id);
    db.habits.push(...starter.habits);
    db.goals.push(...starter.goals);
    db.journals.push(...starter.journals);
    db.focusSessions.push(...starter.focusSessions);
    writeDb(db);
  }

  return user;
}
