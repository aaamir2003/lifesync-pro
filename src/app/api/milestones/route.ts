import { db } from "@/db";
import { milestones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(milestones).values({
    goalId: body.goalId,
    title: body.title,
    status: "pending",
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.update(milestones).set({
    title: body.title,
    status: body.status,
  }).where(eq(milestones.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(milestones).where(eq(milestones.id, id));
  return NextResponse.json({ ok: true });
}
