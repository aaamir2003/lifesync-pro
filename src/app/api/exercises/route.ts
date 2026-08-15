import { db } from "@/db";
import { exercises } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(exercises).values({
    workoutId: body.workoutId,
    name: body.name,
    sets: body.sets || 0,
    reps: body.reps || 0,
    weight: body.weight || 0,
    durationMinutes: body.durationMinutes || 0,
    caloriesBurned: body.caloriesBurned || 0,
    completed: body.completed || false,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.update(exercises).set({
    name: body.name,
    sets: body.sets,
    reps: body.reps,
    weight: body.weight,
    durationMinutes: body.durationMinutes,
    caloriesBurned: body.caloriesBurned,
    completed: body.completed,
  }).where(eq(exercises.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(exercises).where(eq(exercises.id, id));
  return NextResponse.json({ ok: true });
}
