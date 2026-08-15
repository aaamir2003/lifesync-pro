import { db } from "@/db";
import { habits, habitLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const rows = await db.select().from(habits).orderBy(habits.createdAt);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(habits).values({
    name: body.name,
    icon: body.icon || "⭐",
    color: body.color || "#6366f1",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.update(habits).set({
    name: body.name,
    icon: body.icon,
    color: body.color,
    currentStreak: body.currentStreak,
    longestStreak: body.longestStreak,
  }).where(eq(habits.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(habits).where(eq(habits.id, id));
  return NextResponse.json({ ok: true });
}
