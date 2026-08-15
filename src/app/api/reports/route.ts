import { db } from "@/db";
import {
  studySessions,
  workouts,
  habits,
  habitLogs,
  goals,
  dailyActivity,
  healthMetrics,
  subjects,
} from "@/db/schema";
import { and, gte, lte, eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
  const to = searchParams.get("to") || new Date().toISOString().split("T")[0];

  // Study stats
  const studyData = await db
    .select({
      date: studySessions.date,
      totalMinutes: sql<number>`coalesce(sum(${studySessions.completedMinutes}), 0)`,
      sessionCount: sql<number>`count(*)`,
      pomodoroCount: sql<number>`coalesce(sum(${studySessions.pomodoroCount}), 0)`,
    })
    .from(studySessions)
    .where(and(gte(studySessions.date, from), lte(studySessions.date, to)))
    .groupBy(studySessions.date)
    .orderBy(studySessions.date);

  const totalStudyMinutes = studyData.reduce((a, b) => a + Number(b.totalMinutes), 0);
  const totalPomodoros = studyData.reduce((a, b) => a + Number(b.pomodoroCount), 0);
  const totalSessions = studyData.reduce((a, b) => a + Number(b.sessionCount), 0);

  // Workout stats
  const workoutData = await db
    .select()
    .from(workouts)
    .where(and(gte(workouts.scheduledDate, from), lte(workouts.scheduledDate, to)));

  const completedWorkouts = workoutData.filter((w) => w.completed).length;
  const workoutsByType = workoutData.reduce((acc, w) => {
    acc[w.type] = (acc[w.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Habit stats
  const allHabits = await db.select().from(habits);
  const habitLogData = await db
    .select()
    .from(habitLogs)
    .where(and(gte(habitLogs.date, from), lte(habitLogs.date, to)));

  const completedHabitLogs = habitLogData.filter((l) => l.completed).length;
  const habitCompletionRate =
    habitLogData.length > 0
      ? Math.round((completedHabitLogs / habitLogData.length) * 100)
      : 0;

  const topStreaks = [...allHabits]
    .sort((a, b) => b.currentStreak - a.currentStreak)
    .slice(0, 5);

  // Activity stats
  const activityData = await db
    .select()
    .from(dailyActivity)
    .where(and(gte(dailyActivity.date, from), lte(dailyActivity.date, to)));

  const totalSteps = activityData.reduce((a, b) => a + b.steps, 0);
  const totalActiveMinutes = activityData.reduce((a, b) => a + b.activeMinutes, 0);
  const totalCalories = activityData.reduce((a, b) => a + b.caloriesBurned, 0);

  // Health stats
  const healthData = await db
    .select()
    .from(healthMetrics)
    .where(and(gte(healthMetrics.date, from), lte(healthMetrics.date, to)));

  const avgSleep =
    healthData.length > 0
      ? healthData.reduce((a, b) => a + b.sleepHours, 0) / healthData.length
      : 0;
  const avgWater =
    healthData.length > 0
      ? healthData.reduce((a, b) => a + b.waterIntakeMl, 0) / healthData.length
      : 0;

  // Goals
  const allGoals = await db.select().from(goals);
  const completedGoals = allGoals.filter((g) => g.completed).length;

  // Subjects
  const allSubjects = await db.select().from(subjects);

  return NextResponse.json({
    period: { from, to },
    study: {
      totalMinutes: totalStudyMinutes,
      totalHours: Math.round((totalStudyMinutes / 60) * 10) / 10,
      totalSessions,
      totalPomodoros,
      avgMinutesPerDay: studyData.length > 0 ? Math.round(totalStudyMinutes / studyData.length) : 0,
      dailyData: studyData.map((d) => ({
        date: d.date,
        minutes: Number(d.totalMinutes),
        hours: Math.round((Number(d.totalMinutes) / 60) * 10) / 10,
      })),
    },
    workouts: {
      total: workoutData.length,
      completed: completedWorkouts,
      completionRate: workoutData.length > 0 ? Math.round((completedWorkouts / workoutData.length) * 100) : 0,
      byType: workoutsByType,
    },
    habits: {
      total: allHabits.length,
      completionRate: habitCompletionRate,
      totalCompletions: completedHabitLogs,
      topStreaks: topStreaks.map((h) => ({
        name: h.name,
        icon: h.icon,
        streak: h.currentStreak,
        longestStreak: h.longestStreak,
      })),
    },
    activity: {
      totalSteps,
      totalActiveMinutes,
      totalCalories: Math.round(totalCalories),
      avgStepsPerDay: activityData.length > 0 ? Math.round(totalSteps / activityData.length) : 0,
      dailyData: activityData.map((d) => ({
        date: d.date,
        steps: d.steps,
        activeMinutes: d.activeMinutes,
        calories: Math.round(d.caloriesBurned),
      })),
    },
    health: {
      avgSleepHours: Math.round(avgSleep * 10) / 10,
      avgWaterMl: Math.round(avgWater),
      daysTracked: healthData.length,
    },
    goals: {
      total: allGoals.length,
      completed: completedGoals,
      active: allGoals.length - completedGoals,
      completionRate: allGoals.length > 0 ? Math.round((completedGoals / allGoals.length) * 100) : 0,
    },
    subjects: allSubjects.map((s) => ({
      name: s.name,
      color: s.color,
      progress: s.totalChapters > 0 ? Math.round((s.completedChapters / s.totalChapters) * 100) : 0,
      chapters: `${s.completedChapters}/${s.totalChapters}`,
    })),
  });
}
