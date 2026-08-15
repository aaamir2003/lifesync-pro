import { db } from "@/db";
import { habitLogs, habits } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const habitId = searchParams.get("habitId");

  let rows;
  if (from && to && habitId) {
    rows = await db
      .select()
      .from(habitLogs)
      .where(
        and(
          eq(habitLogs.habitId, Number(habitId)),
          gte(habitLogs.date, from),
          lte(habitLogs.date, to)
        )
      );
  } else if (from && to) {
    rows = await db
      .select()
      .from(habitLogs)
      .where(and(gte(habitLogs.date, from), lte(habitLogs.date, to)));
  } else {
    rows = await db.select().from(habitLogs);
  }
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  // Check if log already exists
  const existing = await db
    .select()
    .from(habitLogs)
    .where(
      and(
        eq(habitLogs.habitId, body.habitId),
        eq(habitLogs.date, body.date)
      )
    );

  if (existing.length > 0) {
    // Toggle completion
    const newCompleted = !existing[0].completed;
    const [row] = await db
      .update(habitLogs)
      .set({ completed: newCompleted })
      .where(eq(habitLogs.id, existing[0].id))
      .returning();

    // Update streak
    await updateStreak(body.habitId);
    return NextResponse.json(row);
  }

  const [row] = await db.insert(habitLogs).values({
    habitId: body.habitId,
    date: body.date,
    completed: true,
  }).returning();

  await updateStreak(body.habitId);
  return NextResponse.json(row, { status: 201 });
}

async function updateStreak(habitId: number) {
  const logs = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.habitId, habitId), eq(habitLogs.completed, true)))
    .orderBy(habitLogs.date);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Calculate current streak from today backwards
  const dateSet = new Set(logs.map((l) => l.date));
  const checkDate = new Date(today);

  while (true) {
    const dateStr = checkDate.toISOString().split("T")[0];
    if (dateSet.has(dateStr)) {
      currentStreak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }

  // Calculate longest streak
  for (let i = 0; i < logs.length; i++) {
    if (i === 0) {
      tempStreak = 1;
    } else {
      const prev = new Date(logs[i - 1].date);
      const curr = new Date(logs[i].date);
      const diff = (curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        tempStreak++;
      } else {
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  await db
    .update(habits)
    .set({ currentStreak, longestStreak })
    .where(eq(habits.id, habitId));
}
