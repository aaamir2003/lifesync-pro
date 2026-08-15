import { db } from "@/db";
import { workouts, exercises } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  let rows;
  if (from && to) {
    rows = await db
      .select()
      .from(workouts)
      .where(and(gte(workouts.scheduledDate, from), lte(workouts.scheduledDate, to)))
      .orderBy(workouts.scheduledDate);
  } else {
    rows = await db.select().from(workouts).orderBy(workouts.scheduledDate);
  }

  // Fetch exercises for each workout
  const result = await Promise.all(
    rows.map(async (w) => {
      const exs = await db.select().from(exercises).where(eq(exercises.workoutId, w.id));
      return { ...w, exercises: exs };
    })
  );

  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.insert(workouts).values({
    name: body.name,
    type: body.type || "strength",
    scheduledDate: body.scheduledDate,
    completed: body.completed || false,
    notes: body.notes || null,
  }).returning();

  // Insert exercises if provided
  if (body.exercises && Array.isArray(body.exercises)) {
    for (const ex of body.exercises) {
      await db.insert(exercises).values({
        workoutId: row.id,
        name: ex.name,
        sets: ex.sets || 0,
        reps: ex.reps || 0,
        weight: ex.weight || 0,
        durationMinutes: ex.durationMinutes || 0,
        caloriesBurned: ex.caloriesBurned || 0,
        completed: ex.completed || false,
      });
    }
  }

  return NextResponse.json(row, { status: 201 });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();
  const [row] = await db.update(workouts).set({
    name: body.name,
    type: body.type,
    scheduledDate: body.scheduledDate,
    completed: body.completed,
    notes: body.notes,
  }).where(eq(workouts.id, body.id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = Number(searchParams.get("id"));
  await db.delete(workouts).where(eq(workouts.id, id));
  return NextResponse.json({ ok: true });
}
