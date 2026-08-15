import { db } from "@/db";
import {
  subjects,
  studySessions,
  workouts,
  exercises,
  habits,
  habitLogs,
  goals,
  milestones,
  dailyActivity,
  badges,
  userBadges,
  quotes,
  healthMetrics,
} from "@/db/schema";
import { NextResponse } from "next/server";

export async function POST() {
  const today = new Date();
  const toISO = (d: Date) => d.toISOString().split("T")[0];

  // Clear existing data
  await db.delete(userBadges);
  await db.delete(badges);
  await db.delete(quotes);

  // Seed Badges
  const badgeData = await db
    .insert(badges)
    .values([
      { name: "First Steps", description: "Complete your first habit", icon: "🌱", type: "completion" as const, requirement: 1, color: "#10b981" },
      { name: "Week Warrior", description: "Maintain a 7-day streak", icon: "🔥", type: "streak" as const, requirement: 7, color: "#f59e0b" },
      { name: "Consistency King", description: "Maintain a 30-day streak", icon: "👑", type: "streak" as const, requirement: 30, color: "#6366f1" },
      { name: "Goal Getter", description: "Complete your first goal", icon: "🎯", type: "milestone" as const, requirement: 1, color: "#8b5cf6" },
      { name: "Achiever", description: "Complete 5 goals", icon: "🏆", type: "milestone" as const, requirement: 5, color: "#f43f5e" },
      { name: "Habit Master", description: "Complete 50 habit check-ins", icon: "⭐", type: "completion" as const, requirement: 50, color: "#0ea5e9" },
      { name: "Study Champion", description: "Complete 100 habit check-ins", icon: "📚", type: "completion" as const, requirement: 100, color: "#06b6d4" },
    ])
    .returning();

  // Award some badges
  await db.insert(userBadges).values([
    { badgeId: badgeData[0].id },
    { badgeId: badgeData[1].id },
    { badgeId: badgeData[3].id },
  ]);

  // Seed Quotes
  await db.insert(quotes).values([
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain", category: "motivation" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius", category: "perseverance" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts.", author: "Winston Churchill", category: "motivation" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs", category: "passion" },
    { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt", category: "confidence" },
    { text: "Your limitation—it's only your imagination.", author: "Unknown", category: "mindset" },
    { text: "Push yourself, because no one else is going to do it for you.", author: "Unknown", category: "motivation" },
    { text: "Great things never come from comfort zones.", author: "Unknown", category: "growth" },
    { text: "Dream it. Wish it. Do it.", author: "Unknown", category: "action" },
    { text: "The harder you work for something, the greater you'll feel when you achieve it.", author: "Unknown", category: "effort" },
  ]);

  // Subjects with priority
  const [math, physics, cs] = await db
    .insert(subjects)
    .values([
      { name: "Mathematics", color: "#6366f1", priority: "high" as const, totalChapters: 12, completedChapters: 7, examDate: "2026-03-15" },
      { name: "Physics", color: "#0ea5e9", priority: "medium" as const, totalChapters: 10, completedChapters: 4, examDate: "2026-03-20" },
      { name: "Computer Science", color: "#10b981", priority: "high" as const, totalChapters: 8, completedChapters: 6 },
    ])
    .returning();

  // Study sessions
  await db.insert(studySessions).values([
    { subjectId: math.id, title: "Linear Algebra Ch. 8", priority: "high" as const, durationMinutes: 50, completedMinutes: 35, pomodoroCount: 1, date: toISO(today) },
    { subjectId: physics.id, title: "Thermodynamics review", priority: "medium" as const, durationMinutes: 25, completedMinutes: 25, pomodoroCount: 1, date: toISO(today) },
    { subjectId: cs.id, title: "Binary Trees practice", priority: "urgent" as const, durationMinutes: 45, completedMinutes: 20, pomodoroCount: 0, date: toISO(today) },
  ]);

  // Past study sessions
  for (let i = 1; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    await db.insert(studySessions).values({
      subjectId: [math.id, physics.id, cs.id][i % 3],
      title: `Study session day -${i}`,
      priority: (["low", "medium", "high"] as const)[i % 3],
      durationMinutes: 30 + (i * 10),
      completedMinutes: 20 + (i * 8),
      pomodoroCount: i % 3,
      date: toISO(d),
    });
  }

  // Workouts with new types
  const [w1, w2] = await db
    .insert(workouts)
    .values([
      { name: "Morning HIIT", type: "cardio" as const, scheduledDate: toISO(today), completed: true },
      { name: "Upper Body", type: "strength" as const, scheduledDate: toISO(today), completed: false },
    ])
    .returning();

  await db.insert(exercises).values([
    { workoutId: w1.id, name: "Burpees", sets: 3, reps: 15, durationMinutes: 5, caloriesBurned: 80, completed: true },
    { workoutId: w1.id, name: "Mountain Climbers", sets: 3, reps: 20, durationMinutes: 4, caloriesBurned: 60, completed: true },
    { workoutId: w2.id, name: "Bench Press", sets: 4, reps: 10, weight: 60, completed: false },
    { workoutId: w2.id, name: "Overhead Press", sets: 3, reps: 12, weight: 30, completed: false },
    { workoutId: w2.id, name: "Dumbbell Rows", sets: 3, reps: 12, weight: 20, completed: false },
  ]);

  // Past workouts
  for (let i = 1; i <= 5; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const types: ("strength" | "cardio" | "yoga" | "running")[] = ["strength", "cardio", "yoga", "running"];
    await db.insert(workouts).values({
      name: i % 2 === 0 ? "Leg Day" : "Cardio Run",
      type: types[i % 4],
      scheduledDate: toISO(d),
      completed: i < 4,
    });
  }

  // Habits
  const habitData = await db
    .insert(habits)
    .values([
      { name: "Meditate 10 min", icon: "🧘", color: "#6366f1", currentStreak: 5, longestStreak: 12, totalCompletions: 45 },
      { name: "Read 20 pages", icon: "📚", color: "#0ea5e9", currentStreak: 3, longestStreak: 8, totalCompletions: 32 },
      { name: "Drink 2L water", icon: "💧", color: "#10b981", currentStreak: 7, longestStreak: 14, totalCompletions: 56 },
      { name: "Journal", icon: "📝", color: "#f59e0b", currentStreak: 2, longestStreak: 5, totalCompletions: 18 },
      { name: "No social media", icon: "📵", color: "#f43f5e", currentStreak: 0, longestStreak: 3, totalCompletions: 8 },
    ])
    .returning();

  // Habit logs
  for (const h of habitData) {
    for (let i = 0; i < h.currentStreak; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      await db.insert(habitLogs).values({
        habitId: h.id,
        date: toISO(d),
        completed: true,
      });
    }
  }

  // Goals
  const [g1, g2, g3] = await db
    .insert(goals)
    .values([
      { title: "Complete React Advanced Course", description: "Finish all modules and build final project", type: "short_term" as const, category: "study", targetDate: "2026-02-28", progress: 0 },
      { title: "Run a Half Marathon", description: "Train and complete a 21km race", type: "long_term" as const, category: "fitness", targetDate: "2026-06-01", progress: 0 },
      { title: "Get 4.0 GPA This Semester", description: "Excel in all courses", type: "long_term" as const, category: "study", targetDate: "2026-05-15", progress: 0 },
    ])
    .returning();

  await db.insert(milestones).values([
    { goalId: g1.id, title: "Complete React Hooks module", status: "completed" as const },
    { goalId: g1.id, title: "Build Todo app project", status: "completed" as const },
    { goalId: g1.id, title: "Learn Redux Toolkit", status: "pending" as const },
    { goalId: g1.id, title: "Build final project", status: "pending" as const },
    { goalId: g2.id, title: "Run 5km without stopping", status: "completed" as const },
    { goalId: g2.id, title: "Run 10km under 60 min", status: "pending" as const },
    { goalId: g2.id, title: "Complete 15km training run", status: "pending" as const },
    { goalId: g2.id, title: "Run the half marathon", status: "pending" as const },
    { goalId: g3.id, title: "Score A in Mathematics midterm", status: "completed" as const },
    { goalId: g3.id, title: "Score A in Physics midterm", status: "pending" as const },
    { goalId: g3.id, title: "Complete all CS assignments", status: "pending" as const },
  ]);

  // Daily activity
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    await db.insert(dailyActivity).values({
      date: toISO(d),
      steps: 4000 + Math.floor(Math.random() * 8000),
      activeMinutes: 15 + Math.floor(Math.random() * 45),
      caloriesBurned: 200 + Math.floor(Math.random() * 400),
      stepsGoal: 10000,
      activeMinutesGoal: 30,
      caloriesGoal: 500,
    });
  }

  // Health metrics
  for (let i = 0; i <= 7; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    await db.insert(healthMetrics).values({
      date: toISO(d),
      waterIntakeMl: 1500 + Math.floor(Math.random() * 1500),
      waterGoalMl: 2500,
      sleepHours: 5 + Math.random() * 4,
      sleepGoalHours: 8,
      mood: Math.floor(Math.random() * 3) + 3,
      energyLevel: Math.floor(Math.random() * 3) + 3,
    });
  }

  return NextResponse.json({ ok: true, message: "Database seeded with LifeSync Pro demo data!" });
}
