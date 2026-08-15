import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  date,
  real,
  serial,
  pgEnum,
} from "drizzle-orm/pg-core";

// ══════════════════════════════════════════════════════════
// ENUMS
// ══════════════════════════════════════════════════════════

export const taskStatusEnum = pgEnum("task_status", [
  "pending",
  "in_progress",
  "completed",
  "cancelled",
]);

export const priorityEnum = pgEnum("priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

export const workoutTypeEnum = pgEnum("workout_type", [
  "strength",
  "cardio",
  "flexibility",
  "sports",
  "yoga",
  "running",
  "swimming",
  "other",
]);

export const goalTypeEnum = pgEnum("goal_type", [
  "long_term",
  "short_term",
]);

export const milestoneStatusEnum = pgEnum("milestone_status", [
  "pending",
  "completed",
]);

export const badgeTypeEnum = pgEnum("badge_type", [
  "streak",
  "completion",
  "milestone",
  "special",
]);

// ══════════════════════════════════════════════════════════
// SUBJECTS & STUDY
// ══════════════════════════════════════════════════════════

export const subjects = pgTable("subjects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  color: text("color").notNull().default("#6366f1"),
  priority: priorityEnum("priority").notNull().default("medium"),
  totalChapters: integer("total_chapters").notNull().default(0),
  completedChapters: integer("completed_chapters").notNull().default(0),
  examDate: date("exam_date"),
  deadline: date("deadline"),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  subjectId: integer("subject_id").references(() => subjects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  priority: priorityEnum("priority").notNull().default("medium"),
  durationMinutes: integer("duration_minutes").notNull().default(25),
  completedMinutes: integer("completed_minutes").notNull().default(0),
  pomodoroCount: integer("pomodoro_count").notNull().default(0),
  date: date("date").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Sub-tasks for study sessions (checklists)
export const studyTasks = pgTable("study_tasks", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => studySessions.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  sortOrder: integer("sort_order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ══════════════════════════════════════════════════════════
// FITNESS & HEALTH
// ══════════════════════════════════════════════════════════

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: workoutTypeEnum("type").notNull().default("strength"),
  scheduledDate: date("scheduled_date").notNull(),
  completed: boolean("completed").notNull().default(false),
  notes: text("notes"),
  durationMinutes: integer("duration_minutes").default(0),
  caloriesBurned: real("calories_burned").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exercises = pgTable("exercises", {
  id: serial("id").primaryKey(),
  workoutId: integer("workout_id").references(() => workouts.id, { onDelete: "cascade" }).notNull(),
  name: text("name").notNull(),
  sets: integer("sets").default(0),
  reps: integer("reps").default(0),
  weight: real("weight").default(0),
  durationMinutes: integer("duration_minutes").default(0),
  caloriesBurned: real("calories_burned").default(0),
  completed: boolean("completed").notNull().default(false),
});

// Health metrics: water, sleep, etc.
export const healthMetrics = pgTable("health_metrics", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  waterIntakeMl: integer("water_intake_ml").notNull().default(0),
  waterGoalMl: integer("water_goal_ml").notNull().default(2500),
  sleepHours: real("sleep_hours").notNull().default(0),
  sleepGoalHours: real("sleep_goal_hours").notNull().default(8),
  weight: real("weight"),
  mood: integer("mood"), // 1-5 scale
  energyLevel: integer("energy_level"), // 1-5 scale
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const dailyActivity = pgTable("daily_activity", {
  id: serial("id").primaryKey(),
  date: date("date").notNull(),
  steps: integer("steps").notNull().default(0),
  activeMinutes: integer("active_minutes").notNull().default(0),
  caloriesBurned: real("calories_burned").notNull().default(0),
  stepsGoal: integer("steps_goal").notNull().default(10000),
  activeMinutesGoal: integer("active_minutes_goal").notNull().default(30),
  caloriesGoal: real("calories_goal").notNull().default(500),
});

// ══════════════════════════════════════════════════════════
// HABITS & GOALS
// ══════════════════════════════════════════════════════════

export const habits = pgTable("habits", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull().default("⭐"),
  color: text("color").notNull().default("#6366f1"),
  description: text("description"),
  frequency: text("frequency").notNull().default("daily"), // daily, weekly
  currentStreak: integer("current_streak").notNull().default(0),
  longestStreak: integer("longest_streak").notNull().default(0),
  totalCompletions: integer("total_completions").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const habitLogs = pgTable("habit_logs", {
  id: serial("id").primaryKey(),
  habitId: integer("habit_id").references(() => habits.id, { onDelete: "cascade" }).notNull(),
  date: date("date").notNull(),
  completed: boolean("completed").notNull().default(false),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  type: goalTypeEnum("type").notNull().default("short_term"),
  category: text("category").default("general"), // study, fitness, personal
  targetDate: date("target_date"),
  progress: integer("progress").notNull().default(0),
  completed: boolean("completed").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const milestones = pgTable("milestones", {
  id: serial("id").primaryKey(),
  goalId: integer("goal_id").references(() => goals.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  status: milestoneStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ══════════════════════════════════════════════════════════
// GAMIFICATION
// ══════════════════════════════════════════════════════════

export const badges = pgTable("badges", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon").notNull(),
  type: badgeTypeEnum("type").notNull(),
  requirement: integer("requirement").notNull(), // e.g., 7 for 7-day streak
  color: text("color").notNull().default("#6366f1"),
});

export const userBadges = pgTable("user_badges", {
  id: serial("id").primaryKey(),
  badgeId: integer("badge_id").references(() => badges.id, { onDelete: "cascade" }).notNull(),
  earnedAt: timestamp("earned_at").defaultNow().notNull(),
});

export const quotes = pgTable("quotes", {
  id: serial("id").primaryKey(),
  text: text("text").notNull(),
  author: text("author").notNull(),
  category: text("category").default("motivation"),
});

// ══════════════════════════════════════════════════════════
// USER PREFERENCES
// ══════════════════════════════════════════════════════════

export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  theme: text("theme").notNull().default("system"), // light, dark, system
  pomodoroWorkMinutes: integer("pomodoro_work_minutes").notNull().default(25),
  pomodoroBreakMinutes: integer("pomodoro_break_minutes").notNull().default(5),
  weekStartsOn: integer("week_starts_on").notNull().default(0), // 0 = Sunday
  defaultView: text("default_view").notNull().default("dashboard"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
