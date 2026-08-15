"use client";

import { useEffect, useState, useCallback } from "react";
import {
  BookOpen,
  Dumbbell,
  Target,
  Plus,
  CheckCircle2,
  Clock,
  TrendingUp,
  Activity,
  Footprints,
  Flame,
  ChevronLeft,
  ChevronRight,
  Quote,
  Award,
  Sparkles,
  Droplets,
  Moon,
  Zap,
} from "lucide-react";
import ProgressRing from "./ProgressRing";
import Modal from "./Modal";

interface DashboardData {
  date: string;
  study: {
    sessions: Array<{ id: number; title: string; completedMinutes: number; durationMinutes: number }>;
    completedMinutes: number;
    targetMinutes: number;
    percentage: number;
  };
  workouts: {
    items: Array<{ id: number; name: string; completed: boolean; type: string }>;
    total: number;
    completed: number;
    percentage: number;
  };
  habits: {
    total: number;
    completedToday: number;
    percentage: number;
    items: Array<{ id: number; name: string; icon: string; color: string; currentStreak: number }>;
    logs: Array<{ habitId: number }>;
  };
  activity: {
    steps: number;
    activeMinutes: number;
    caloriesBurned: number;
    stepsGoal: number;
    activeMinutesGoal: number;
    caloriesGoal: number;
  } | null;
  goals: Array<{ id: number; title: string; progress: number; type: string }>;
  subjects: Array<{ id: number; name: string; color: string }>;
}

interface QuoteData {
  text: string;
  author: string;
}

interface Badge {
  id: number;
  name: string;
  description: string;
  icon: string;
  type: string;
  earned: boolean;
  color: string;
}

interface QuickAddProps {
  type: "study" | "workout" | "habit";
  date: string;
  subjects: Array<{ id: number; name: string }>;
  onDone: () => void;
}

function QuickAddForm({ type, date, subjects, onDone }: QuickAddProps) {
  const [loading, setLoading] = useState(false);

  async function handleStudy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/study-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        subjectId: fd.get("subjectId") ? Number(fd.get("subjectId")) : null,
        durationMinutes: Number(fd.get("duration")),
        date,
      }),
    });
    setLoading(false);
    onDone();
  }

  async function handleWorkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        type: fd.get("type"),
        scheduledDate: date,
      }),
    });
    setLoading(false);
    onDone();
  }

  async function handleHabit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    const fd = new FormData(e.currentTarget);
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        icon: fd.get("icon") || "⭐",
      }),
    });
    setLoading(false);
    onDone();
  }

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm transition-all input";

  if (type === "study") {
    return (
      <form onSubmit={handleStudy} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title</label>
          <input name="title" required className={inputClass} placeholder="e.g., Chapter 5 review" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Subject</label>
          <select name="subjectId" className={inputClass}>
            <option value="">No subject</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Duration (minutes)</label>
          <input name="duration" type="number" defaultValue={25} min={5} className={inputClass} />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl btn-primary text-sm font-medium disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Study Session"}
        </button>
      </form>
    );
  }

  if (type === "workout") {
    return (
      <form onSubmit={handleWorkout} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Workout Name</label>
          <input name="name" required className={inputClass} placeholder="e.g., Upper body" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
          <select name="type" className={inputClass}>
            <option value="strength">Strength</option>
            <option value="cardio">Cardio</option>
            <option value="flexibility">Flexibility</option>
            <option value="yoga">Yoga</option>
            <option value="running">Running</option>
            <option value="sports">Sports</option>
            <option value="other">Other</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition disabled:opacity-50"
        >
          {loading ? "Adding..." : "Add Workout"}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleHabit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Habit Name</label>
        <input name="name" required className={inputClass} placeholder="e.g., Meditate" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Icon (emoji)</label>
        <input name="icon" className={inputClass} defaultValue="⭐" placeholder="⭐" />
      </div>
      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 transition disabled:opacity-50"
      >
        {loading ? "Adding..." : "Add Habit"}
      </button>
    </form>
  );
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [quote, setQuote] = useState<QuoteData | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [modal, setModal] = useState<{ type: "study" | "workout" | "habit" } | null>(null);

  const fetchData = useCallback(async () => {
    const [dashRes, quoteRes, badgeRes] = await Promise.all([
      fetch(`/api/dashboard?date=${currentDate}`),
      fetch("/api/quotes"),
      fetch("/api/badges"),
    ]);
    setData(await dashRes.json());
    setQuote(await quoteRes.json());
    setBadges(await badgeRes.json());
  }, [currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleHabit(habitId: number) {
    await fetch("/api/habit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date: currentDate }),
    });
    fetchData();
  }

  async function toggleWorkout(workoutId: number, completed: boolean) {
    await fetch("/api/workouts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: workoutId, completed: !completed }),
    });
    fetchData();
  }

  function prevDay() {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() - 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  }

  function nextDay() {
    const d = new Date(currentDate + "T00:00:00");
    d.setDate(d.getDate() + 1);
    setCurrentDate(d.toISOString().split("T")[0]);
  }

  if (!data)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );

  const displayDate = new Date(currentDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const overallPercent = Math.round(
    ((data.study.percentage + data.workouts.percentage + data.habits.percentage) / 3)
  );

  const earnedBadges = badges.filter((b) => b.earned);

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Quote Banner */}
      {quote && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-violet-600 to-cyan-600 p-6 text-white shadow-xl animate-fade-in-up">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          <Quote size={24} className="mb-3 opacity-60" />
          <p className="text-lg font-medium leading-relaxed mb-2 relative z-10">
            &ldquo;{quote.text}&rdquo;
          </p>
          <p className="text-sm opacity-80">— {quote.author}</p>
        </div>
      )}

      {/* Date nav */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Daily Overview</h2>
          <p className="text-sm text-[var(--text-tertiary)] mt-0.5">{displayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevDay} className="p-2 rounded-xl card hover:shadow-md text-[var(--text-secondary)]">
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={() => setCurrentDate(new Date().toISOString().split("T")[0])}
            className="px-4 py-2 rounded-xl text-sm font-medium card hover:shadow-md"
          >
            Today
          </button>
          <button onClick={nextDay} className="p-2 rounded-xl card hover:shadow-md text-[var(--text-secondary)]">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Progress rings */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="card p-5 flex flex-col items-center hover:shadow-lg transition-shadow">
          <ProgressRing percent={overallPercent} color="#6366f1" label="Overall" sublabel="Daily Goals" />
        </div>
        <div className="card p-5 flex flex-col items-center hover:shadow-lg transition-shadow">
          <ProgressRing percent={data.study.percentage} color="#0ea5e9" label="Study" sublabel={`${data.study.completedMinutes}/${data.study.targetMinutes} min`} />
        </div>
        <div className="card p-5 flex flex-col items-center hover:shadow-lg transition-shadow">
          <ProgressRing percent={data.workouts.percentage} color="#10b981" label="Workouts" sublabel={`${data.workouts.completed}/${data.workouts.total}`} />
        </div>
        <div className="card p-5 flex flex-col items-center hover:shadow-lg transition-shadow">
          <ProgressRing percent={data.habits.percentage} color="#f59e0b" label="Habits" sublabel={`${data.habits.completedToday}/${data.habits.total}`} />
        </div>
      </div>

      {/* Quick add buttons */}
      <div className="flex flex-wrap gap-3 no-print">
        <button
          onClick={() => setModal({ type: "study" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-50 dark:bg-sky-500/10 text-sky-700 dark:text-sky-400 font-medium text-sm hover:shadow-md border border-sky-200 dark:border-sky-500/20 transition-all"
        >
          <Plus size={16} /> Study Session
        </button>
        <button
          onClick={() => setModal({ type: "workout" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-medium text-sm hover:shadow-md border border-emerald-200 dark:border-emerald-500/20 transition-all"
        >
          <Plus size={16} /> Workout
        </button>
        <button
          onClick={() => setModal({ type: "habit" })}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 font-medium text-sm hover:shadow-md border border-amber-200 dark:border-amber-500/20 transition-all"
        >
          <Plus size={16} /> New Habit
        </button>
      </div>

      {/* Badges (if any) */}
      {earnedBadges.length > 0 && (
        <div className="card p-5 animate-fade-in">
          <div className="flex items-center gap-2 mb-4">
            <Award size={18} className="text-amber-500" />
            <h3 className="font-semibold text-[var(--text-primary)]">Your Badges</h3>
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
          </div>
          <div className="flex flex-wrap gap-3">
            {earnedBadges.slice(0, 6).map((badge) => (
              <div
                key={badge.id}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-500/10 dark:to-orange-500/10 border border-amber-200 dark:border-amber-500/20"
                title={badge.description}
              >
                <span className="text-lg">{badge.icon}</span>
                <span className="text-sm font-medium text-[var(--text-primary)]">{badge.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {/* Study Sessions */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/20">
              <BookOpen size={18} className="text-sky-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Study Sessions</h3>
          </div>
          {data.study.sessions.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No sessions scheduled</p>
          ) : (
            <div className="space-y-2">
              {data.study.sessions.map((s, idx) => (
                <div key={s.id} className={`flex items-center justify-between p-3 rounded-xl bg-[var(--surface-tertiary)] animate-fade-in stagger-${Math.min(idx + 1, 5)}`}>
                  <div>
                    <div className="text-sm font-medium text-[var(--text-primary)]">{s.title}</div>
                    <div className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 mt-0.5">
                      <Clock size={12} /> {s.completedMinutes}/{s.durationMinutes} min
                    </div>
                  </div>
                  <div className="text-xs font-medium text-sky-500">
                    {s.durationMinutes > 0 ? Math.round((s.completedMinutes / s.durationMinutes) * 100) : 0}%
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Workouts */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-500/20">
              <Dumbbell size={18} className="text-emerald-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Workouts</h3>
          </div>
          {data.workouts.items.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No workouts scheduled</p>
          ) : (
            <div className="space-y-2">
              {data.workouts.items.map((w, idx) => (
                <button
                  key={w.id}
                  onClick={() => toggleWorkout(w.id, w.completed)}
                  className={`flex items-center gap-3 w-full p-3 rounded-xl bg-[var(--surface-tertiary)] hover:shadow-md transition-all text-left animate-fade-in stagger-${Math.min(idx + 1, 5)}`}
                >
                  <CheckCircle2
                    size={20}
                    className={`transition-colors ${w.completed ? "text-emerald-500" : "text-[var(--text-tertiary)]"}`}
                  />
                  <div>
                    <div className={`text-sm font-medium transition-all ${w.completed ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"}`}>
                      {w.name}
                    </div>
                    <div className="text-xs text-[var(--text-tertiary)] capitalize">{w.type}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Habits */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/20">
              <Target size={18} className="text-amber-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Daily Habits</h3>
          </div>
          {data.habits.items.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No habits yet</p>
          ) : (
            <div className="space-y-2">
              {data.habits.items.map((h, idx) => {
                const done = data.habits.logs.some((l) => l.habitId === h.id);
                return (
                  <button
                    key={h.id}
                    onClick={() => toggleHabit(h.id)}
                    className={`flex items-center gap-3 w-full p-3 rounded-xl bg-[var(--surface-tertiary)] hover:shadow-md transition-all text-left animate-fade-in stagger-${Math.min(idx + 1, 5)}`}
                  >
                    <span className="text-lg">{h.icon}</span>
                    <div className="flex-1">
                      <div className={`text-sm font-medium transition-all ${done ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"}`}>
                        {h.name}
                      </div>
                      <div className="text-xs text-amber-500 flex items-center gap-1">
                        <Flame size={10} /> {h.currentStreak} day streak
                      </div>
                    </div>
                    <CheckCircle2
                      size={20}
                      className={`transition-colors ${done ? "text-amber-500" : "text-[var(--text-tertiary)]"}`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Activity */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/20">
              <Activity size={18} className="text-rose-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Daily Activity</h3>
          </div>
          {data.activity ? (
            <div className="space-y-4">
              <ActivityBar
                icon={<Footprints size={14} />}
                label="Steps"
                value={data.activity.steps}
                goal={data.activity.stepsGoal}
                color="bg-brand-500"
              />
              <ActivityBar
                icon={<Clock size={14} />}
                label="Active Min"
                value={data.activity.activeMinutes}
                goal={data.activity.activeMinutesGoal}
                color="bg-emerald-500"
              />
              <ActivityBar
                icon={<Flame size={14} />}
                label="Calories"
                value={Math.round(data.activity.caloriesBurned)}
                goal={Math.round(data.activity.caloriesGoal)}
                color="bg-rose-500"
              />
            </div>
          ) : (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No activity data</p>
          )}
        </div>

        {/* Goals */}
        <div className="card p-5 md:col-span-2 xl:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/20">
              <TrendingUp size={18} className="text-brand-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Active Goals</h3>
          </div>
          {data.goals.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No active goals</p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.goals.map((g, idx) => (
                <div key={g.id} className={`p-4 rounded-xl bg-[var(--surface-tertiary)] animate-fade-in stagger-${Math.min(idx + 1, 5)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{g.title}</span>
                    <span className="text-xs font-bold text-brand-500">{g.progress}%</span>
                  </div>
                  <div className="w-full bg-[var(--surface-primary)] rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-brand-500 to-violet-500 rounded-full h-2 transition-all duration-500"
                      style={{ width: `${g.progress}%` }}
                    />
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)] capitalize mt-1.5">{g.type.replace("_", "-")}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick add modal */}
      <Modal
        open={!!modal}
        onClose={() => setModal(null)}
        title={
          modal?.type === "study"
            ? "Add Study Session"
            : modal?.type === "workout"
            ? "Add Workout"
            : "Add Habit"
        }
      >
        {modal && (
          <QuickAddForm
            type={modal.type}
            date={currentDate}
            subjects={data.subjects}
            onDone={() => {
              setModal(null);
              fetchData();
            }}
          />
        )}
      </Modal>
    </div>
  );
}

function ActivityBar({
  icon,
  label,
  value,
  goal,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-sm mb-1.5">
        <span className="flex items-center gap-1.5 text-[var(--text-secondary)]">
          {icon} {label}
        </span>
        <span className="text-[var(--text-tertiary)] font-medium">
          {value.toLocaleString()} / {goal.toLocaleString()}
        </span>
      </div>
      <div className="w-full bg-[var(--surface-tertiary)] rounded-full h-2">
        <div
          className={`${color} rounded-full h-2 transition-all duration-500`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
