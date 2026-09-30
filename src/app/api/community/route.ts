import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies, sanitizeUser } from "@/lib/auth";
import { ensureSessionUser, readDb, writeDb } from "@/lib/db";
import { calculateLevel } from "@/lib/seed";
import { CommunityPost } from "@/lib/types";

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

    if (body.action === "post") {
      const content = (body.content || "").trim();
      if (!content) {
        return NextResponse.json(
          { error: "Post content cannot be empty." },
          { status: 400 }
        );
      }

      const newPost: CommunityPost = {
        id: `pst_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
        userId: dbUser.id,
        authorName: dbUser.name,
        authorHandle: dbUser.handle,
        authorLevel: dbUser.level,
        authorAvatarColor: dbUser.avatarColor,
        authorPillar: dbUser.primaryPillar,
        content,
        tag: body.tag || "Win",
        likes: [],
        comments: [],
        createdAt: new Date().toISOString(),
      };

      db.posts.unshift(newPost);
      dbUser.xp += 30;
      dbUser.level = calculateLevel(dbUser.xp);
      writeDb(db);

      return NextResponse.json({
        posts: db.posts,
        user: sanitizeUser(dbUser),
        xpEarned: 30,
      });
    }

    if (body.action === "like") {
      const post = db.posts.find((p) => p.id === body.postId);
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      if (post.likes.includes(dbUser.id)) {
        post.likes = post.likes.filter((id) => id !== dbUser.id);
      } else {
        post.likes.push(dbUser.id);
      }
      writeDb(db);
      return NextResponse.json({ posts: db.posts });
    }

    if (body.action === "comment") {
      const post = db.posts.find((p) => p.id === body.postId);
      if (!post) {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
      const commentText = (body.content || "").trim();
      if (!commentText) {
        return NextResponse.json(
          { error: "Comment cannot be empty" },
          { status: 400 }
        );
      }
      post.comments.push({
        id: `cmt_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`,
        userId: dbUser.id,
        authorName: dbUser.name,
        authorHandle: dbUser.handle,
        content: commentText,
        createdAt: new Date().toISOString(),
      });
      writeDb(db);
      return NextResponse.json({ posts: db.posts });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Community error:", error);
    return NextResponse.json(
      { error: "Community action failed." },
      { status: 500 }
    );
  }
}
