import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, sanitizeUser } from "@/lib/auth";
import { ensureSessionUser, readDb, writeDb } from "@/lib/db";
import { calculateLevel, getIsoDateOffset } from "@/lib/seed";
import { Goal, GoalMilestone, Pillar } from "@/lib/types";

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
        { error: "Goal title is required." },
        { status: 400 }
      );
    }

    const pillar: Pillar = body.pillar || "Craft";
    const priority = body.priority || "High";
    const targetDate = body.targetDate || getIsoDateOffset(30);
    const rawMilestones: string[] = Array.isArray(body.milestones)
      ? body.milestones.filter((m: string) => typeof m === "string" && m.trim())
      : [];

    const milestones: GoalMilestone[] =
      rawMilestones.length > 0
        ? rawMilestones.map((m, i) => ({
            id: `ms_${Date.now()}_${i}`,
            title: m.trim(),
            completed: false,
          }))
        : [
            {
              id: `ms_${Date.now()}_0`,
              title: "Define execution roadmap & first benchmark",
              completed: false,
            },
            {
              id: `ms_${Date.now()}_1`,
              title: "Reach 50% milestone checkpoint",
              completed: false,
            },
            {
              id: `ms_${Date.now()}_2`,
              title: "Complete final objective & review results",
              completed: false,
            },
          ];

    const newGoal: Goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      title,
      description: (body.description || "").trim(),
      pillar,
      targetDate,
      priority,
      status: "active",
      progress: 0,
      xpReward: priority === "Core" ? 1000 : priority === "High" ? 750 : 500,
      milestones,
      createdAt: new Date().toISOString(),
    };

    db.goals.unshift(newGoal);
    writeDb(db);

    return NextResponse.json({ goal: newGoal });
  } catch (error) {
    console.error("Create goal error:", error);
    return NextResponse.json(
      { error: "Failed to create goal." },
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

    const goal = db.goals.find(
      (g) => g.id === body.goalId && g.userId === user.id
    );
    if (!goal) {
      return NextResponse.json({ error: "Goal not found." }, { status: 404 });
    }

    const dbUser = db.users.find((u) => u.id === user.id)!;
    let xpDelta = 0;

    if (body.milestoneId) {
      const ms = goal.milestones.find((m) => m.id === body.milestoneId);
      if (ms) {
        ms.completed = !ms.completed;
        xpDelta = ms.completed ? 75 : -75;
      }
    }

    if (typeof body.newMilestoneTitle === "string" && body.newMilestoneTitle.trim()) {
      goal.milestones.push({
        id: `ms_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        title: body.newMilestoneTitle.trim(),
        completed: false,
      });
    }

    if (goal.milestones.length > 0) {
      const completedCount = goal.milestones.filter((m) => m.completed).length;
      const prevStatus = goal.status;
      goal.progress = Math.round((completedCount / goal.milestones.length) * 100);
      if (goal.progress === 100 && prevStatus !== "completed") {
        goal.status = "completed";
        xpDelta += 250;
      } else if (goal.progress < 100) {
        goal.status = "active";
      }
    }

    if (xpDelta !== 0) {
      dbUser.xp = Math.max(0, dbUser.xp + xpDelta);
      dbUser.level = calculateLevel(dbUser.xp);
    }

    writeDb(db);

    return NextResponse.json({
      goal,
      user: sanitizeUser(dbUser),
      xpDelta,
    });
  } catch (error) {
    console.error("Update goal error:", error);
    return NextResponse.json(
      { error: "Failed to update goal." },
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
    return NextResponse.json({ error: "Goal ID required" }, { status: 400 });
  }

  const user = ensureSessionUser(session);
  const db = readDb();
  db.goals = db.goals.filter((g) => !(g.id === id && g.userId === user.id));
  writeDb(db);

  return NextResponse.json({ deleted: id });
}
