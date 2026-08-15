import { db } from "@/db";
import { subjects } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(subjects).orderBy(subjects.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(subjects).values({
    name: body.name,
    color: body.color || "#6366f1",
    totalChapters: body.totalChapters || 0,
    completedChapters: body.completedChapters || 0,
    examDate: body.examDate || null,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.update(subjects).set({
    name: body.name,
    color: body.color,
    totalChapters: body.totalChapters,
    completedChapters: body.completedChapters,
    examDate: body.examDate,
  }).where(eq(subjects.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(subjects).where(eq(subjects.id, id));
  return NextResponse.json({ ok: true });
}
