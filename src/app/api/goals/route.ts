import { db } from "@/db";
import { goals, milestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(goals).orderBy(goals.createdAt);
  const result = await Promise.all(
    rows.map(async (g) => {
      const ms = await db.select().from(milestones).where(eq(milestones.goalId, g.id));
      const completedMs = ms.filter((m) => m.status === "completed").length;
      const progress = ms.length > 0 ? Math.round((completedMs / ms.length) * 100) : g.progress;
      return { ...g, milestones: ms, progress };
    })
  );
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(goals).values({
    title: body.title,
    description: body.description || null,
    type: body.type || "short_term",
    targetDate: body.targetDate || null,
    progress: 0,
    completed: false,
  }).returning();

  if (body.milestones && Array.isArray(body.milestones)) {
    for (const m of body.milestones) {
      await db.insert(milestones).values({
        goalId: row.id,
        title: m.title,
        status: "pending",
      });
    }
  }

  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.update(goals).set({
    title: body.title,
    description: body.description,
    type: body.type,
    targetDate: body.targetDate,
    progress: body.progress,
    completed: body.completed,
  }).where(eq(goals.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(goals).where(eq(goals.id, id));
  return NextResponse.json({ ok: true });
}
