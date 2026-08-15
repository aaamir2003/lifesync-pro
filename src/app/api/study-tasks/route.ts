import { db } from "@/db";
import { studyTasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("sessionId");

  if (sessionId) {
    const rows = await db
      .select()
      .from(studyTasks)
      .where(eq(studyTasks.sessionId, Number(sessionId)))
      .orderBy(studyTasks.sortOrder);
    return NextResponse.json(rows);
  }

  return NextResponse.json([]);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db
    .insert(studyTasks)
    .values({
      sessionId: body.sessionId,
      title: body.title,
      completed: false,
      sortOrder: body.sortOrder || 0,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db
    .update(studyTasks)
    .set({
      title: body.title,
      completed: body.completed,
      sortOrder: body.sortOrder,
    })
    .where(eq(studyTasks.id, body.id))
    .returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(studyTasks).where(eq(studyTasks.id, id));
  return NextResponse.json({ ok: true });
}
