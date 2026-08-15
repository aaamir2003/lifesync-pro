import { db } from "@/db";
import { healthMetrics } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const date = searchParams.get("date");

  if (date) {
    const rows = await db
      .select()
      .from(healthMetrics)
      .where(eq(healthMetrics.date, date));
    return NextResponse.json(rows[0] || null);
  }

  const rows = await db.select().from(healthMetrics).orderBy(healthMetrics.date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Upsert: check if record exists for this date
  const existing = await db
    .select()
    .from(healthMetrics)
    .where(eq(healthMetrics.date, body.date));

  if (existing.length > 0) {
    const [row] = await db
      .update(healthMetrics)
      .set({
        waterIntakeMl: body.waterIntakeMl ?? existing[0].waterIntakeMl,
        waterGoalMl: body.waterGoalMl ?? existing[0].waterGoalMl,
        sleepHours: body.sleepHours ?? existing[0].sleepHours,
        sleepGoalHours: body.sleepGoalHours ?? existing[0].sleepGoalHours,
        weight: body.weight ?? existing[0].weight,
        mood: body.mood ?? existing[0].mood,
        energyLevel: body.energyLevel ?? existing[0].energyLevel,
        notes: body.notes ?? existing[0].notes,
      })
      .where(eq(healthMetrics.id, existing[0].id))
      .returning();
    return NextResponse.json(row);
  }

  const [row] = await db
    .insert(healthMetrics)
    .values({
      date: body.date,
      waterIntakeMl: body.waterIntakeMl || 0,
      waterGoalMl: body.waterGoalMl || 2500,
      sleepHours: body.sleepHours || 0,
      sleepGoalHours: body.sleepGoalHours || 8,
      weight: body.weight || null,
      mood: body.mood || null,
      energyLevel: body.energyLevel || null,
      notes: body.notes || null,
    })
    .returning();
  return NextResponse.json(row, { status: 201 });
}
