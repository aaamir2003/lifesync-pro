import { db } from "@/db";
import {
  studySessions,
  workouts,
  habits,
  habitLogs,
  goals,
  dailyActivity,
  subjects,
} from "@/db/schema";
import { and, eq, gte, lte, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateStr =
    searchParams.get("date") || new Date().toISOString().split("T")[0];

  // Today's study sessions
  const todayStudy = await db
    .select()
    .from(studySessions)
    .where(eq(studySessions.date, dateStr));

  const totalStudyMinutes = todayStudy.reduce(
    (acc, s) => acc + (s.completedMinutes || 0),
    0
  );
  const targetStudyMinutes = todayStudy.reduce(
    (acc, s) => acc + (s.durationMinutes || 0),
    0
  );

  // Today's workouts
  const todayWorkouts = await db
    .select()
    .from(workouts)
    .where(eq(workouts.scheduledDate, dateStr));

  const completedWorkouts = todayWorkouts.filter((w) => w.completed).length;

  // Today's habit logs
  const allHabits = await db.select().from(habits);
  const todayLogs = await db
    .select()
    .from(habitLogs)
    .where(and(eq(habitLogs.date, dateStr), eq(habitLogs.completed, true)));

  // Today's activity
  const todayActivityArr = await db
    .select()
    .from(dailyActivity)
    .where(eq(dailyActivity.date, dateStr));
  const todayActivityData = todayActivityArr[0] || null;

  // Active goals
  const activeGoals = await db
    .select()
    .from(goals)
    .where(eq(goals.completed, false));

  // Subjects
  const allSubjects = await db.select().from(subjects);

  return NextResponse.json({
    date: dateStr,
    study: {
      sessions: todayStudy,
      completedMinutes: totalStudyMinutes,
      targetMinutes: targetStudyMinutes || 120,
      percentage:
        targetStudyMinutes > 0
          ? Math.min(
              Math.round((totalStudyMinutes / targetStudyMinutes) * 100),
              100
            )
          : 0,
    },
    workouts: {
      items: todayWorkouts,
      total: todayWorkouts.length,
      completed: completedWorkouts,
      percentage:
        todayWorkouts.length > 0
          ? Math.round((completedWorkouts / todayWorkouts.length) * 100)
          : 0,
    },
    habits: {
      total: allHabits.length,
      completedToday: todayLogs.length,
      percentage:
        allHabits.length > 0
          ? Math.round((todayLogs.length / allHabits.length) * 100)
          : 0,
      items: allHabits,
      logs: todayLogs,
    },
    activity: todayActivityData,
    goals: activeGoals,
    subjects: allSubjects,
  });
}
