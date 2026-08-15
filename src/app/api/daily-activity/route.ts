import { db } from "@/db";
import { dailyActivity } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const date = searchParams.get("date");

  if (date) {
    const rows = await db
      .select()
      .from(dailyActivity)
      .where(eq(dailyActivity.date, date));
    return NextResponse.json(rows[0] || null);
  }

  if (from && to) {
    const rows = await db
      .select()
      .from(dailyActivity)
      .where(and(gte(dailyActivity.date, from), lte(dailyActivity.date, to)))
      .orderBy(dailyActivity.date);
    return NextResponse.json(rows);
  }

  const rows = await db.select().from(dailyActivity).orderBy(dailyActivity.date);
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  // Upsert: check if record exists for this date
  const existing = await db
    .select()
    .from(dailyActivity)
    .where(eq(dailyActivity.date, body.date));

  if (existing.length > 0) {
    const [row] = await db
      .update(dailyActivity)
      .set({
        steps: body.steps ?? existing[0].steps,
        activeMinutes: body.activeMinutes ?? existing[0].activeMinutes,
        caloriesBurned: body.caloriesBurned ?? existing[0].caloriesBurned,
        stepsGoal: body.stepsGoal ?? existing[0].stepsGoal,
        activeMinutesGoal: body.activeMinutesGoal ?? existing[0].activeMinutesGoal,
        caloriesGoal: body.caloriesGoal ?? existing[0].caloriesGoal,
      })
      .where(eq(dailyActivity.id, existing[0].id))
      .returning();
    return NextResponse.json(row);
  }

  const [row] = await db.insert(dailyActivity).values({
    date: body.date,
    steps: body.steps || 0,
    activeMinutes: body.activeMinutes || 0,
    caloriesBurned: body.caloriesBurned || 0,
    stepsGoal: body.stepsGoal || 10000,
    activeMinutesGoal: body.activeMinutesGoal || 30,
    caloriesGoal: body.caloriesGoal || 500,
  }).returning();
  return NextResponse.json(row, { status: 201 });
}
