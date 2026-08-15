import { db } from "@/db";
import { studySessions } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let query = db.select().from(studySessions).orderBy(studySessions.date);

  if (from && to) {
    const rows = await db
      .select()
      .from(studySessions)
      .where(and(gte(studySessions.date, from), lte(studySessions.date, to)))
      .orderBy(studySessions.date);
    return NextResponse.json(rows);
  }

  const rows = await query;
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(studySessions).values({
    subjectId: body.subjectId || null,
    title: body.title,
    durationMinutes: body.durationMinutes || 25,
    completedMinutes: body.completedMinutes || 0,
    pomodoroCount: body.pomodoroCount || 0,
    date: body.date,
    notes: body.notes || null,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.update(studySessions).set({
    subjectId: body.subjectId,
    title: body.title,
    durationMinutes: body.durationMinutes,
    completedMinutes: body.completedMinutes,
    pomodoroCount: body.pomodoroCount,
    date: body.date,
    notes: body.notes,
  }).where(eq(studySessions.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(studySessions).where(eq(studySessions.id, id));
  return NextResponse.json({ ok: true });
}
