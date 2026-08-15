import { db } from "@/db";
import { studySessions, workouts, habits, habitLogs, goals, dailyActivity } from "@/db/schema";
import { and, gte, lte, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];

  // Study hours by date
  const studyByDate = await db
    .select({
      date: studySessions.date,
      totalMinutes: sql<number>`coalesce(sum(${studySessions.completedMinutes}), 0)`,
    })
    .from(studySessions)
    .where(and(gte(studySessions.date, from), lte(studySessions.date, to)))
    .groupBy(studySessions.date)
    .orderBy(studySessions.date);

  // Workout frequency by date
  const workoutByDate = await db
    .select({
      date: workouts.scheduledDate,
      count: sql<number>`count(*)`,
      completed: sql<number>`sum(case when ${workouts.completed} then 1 else 0 end)`,
    })
    .from(workouts)
    .where(and(gte(workouts.scheduledDate, from), lte(workouts.scheduledDate, to)))
    .groupBy(workouts.scheduledDate)
    .orderBy(workouts.scheduledDate);

  // Goal completion rate
  const allGoals = await db.select().from(goals);
  const completedGoals = allGoals.filter((g) => g.completed);

  // Habit completion rate for the period
  const allLogs = await db
    .select()
    .from(habitLogs)
    .where(and(gte(habitLogs.date, from), lte(habitLogs.date, to)));
  const completedLogs = allLogs.filter((l) => l.completed);

  // Activity data
  const activityData = await db
    .select()
    .from(dailyActivity)
    .where(and(gte(dailyActivity.date, from), lte(dailyActivity.date, to)))
    .orderBy(dailyActivity.date);

  return NextResponse.json({
    studyByDate: studyByDate.map((s) => ({
      date: s.date,
      hours: Number(s.totalMinutes) / 60,
    })),
    workoutByDate: workoutByDate.map((w) => ({
      date: w.date,
      count: Number(w.count),
      completed: Number(w.completed),
    })),
    goalStats: {
      total: allGoals.length,
      completed: completedGoals.length,
      rate: allGoals.length > 0 ? Math.round((completedGoals.length / allGoals.length) * 100) : 0,
    },
    habitStats: {
      totalLogs: allLogs.length,
      completedLogs: completedLogs.length,
      rate: allLogs.length > 0 ? Math.round((completedLogs.length / allLogs.length) * 100) : 0,
    },
    activityData,
  });
}
