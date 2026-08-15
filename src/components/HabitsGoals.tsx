"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Target,
  Plus,
  Trash2,
  CheckCircle2,
  Flame,
  TrendingUp,
  Award,
  ChevronRight,
} from "lucide-react";
import Modal from "./Modal";

interface Habit {
  id: number;
  name: string;
  icon: string;
  color: string;
  currentStreak: number;
  longestStreak: number;
  totalCompletions: number;
}

interface HabitLog {
  id: number;
  habitId: number;
  date: string;
  completed: boolean;
}

interface Milestone {
  id: number;
  goalId: number;
  title: string;
  status: string;
}

interface Goal {
  id: number;
  title: string;
  description: string | null;
  type: string;
  category: string | null;
  targetDate: string | null;
  progress: number;
  completed: boolean;
  milestones: Milestone[];
}

export default function HabitsGoals() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showHabitModal, setShowHabitModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  const [milestoneInputs, setMilestoneInputs] = useState<string[]>([""]);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    const [hRes, lRes, gRes] = await Promise.all([
      fetch("/api/habits"),
      fetch(`/api/habit-logs?from=${today}&to=${today}`),
      fetch("/api/goals"),
    ]);
    setHabits(await hRes.json());
    setTodayLogs(await lRes.json());
    setGoals(await gRes.json());
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function toggleHabit(habitId: number) {
    await fetch("/api/habit-logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ habitId, date: today }),
    });
    fetchData();
  }

  async function deleteHabit(id: number) {
    await fetch(`/api/habits?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function addHabit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        icon: fd.get("icon") || "⭐",
        color: fd.get("color") || "#6366f1",
      }),
    });
    setShowHabitModal(false);
    fetchData();
  }

  async function addGoal(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const ms = milestoneInputs.filter((m) => m.trim().length > 0).map((m) => ({ title: m }));
    await fetch("/api/goals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        description: fd.get("description") || null,
        type: fd.get("type"),
        category: fd.get("category") || "general",
        targetDate: fd.get("targetDate") || null,
        milestones: ms,
      }),
    });
    setShowGoalModal(false);
    setMilestoneInputs([""]);
    fetchData();
  }

  async function toggleMilestone(m: Milestone) {
    await fetch("/api/milestones", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: m.id,
        status: m.status === "completed" ? "pending" : "completed",
      }),
    });
    fetchData();
  }

  async function deleteGoal(id: number) {
    await fetch(`/api/goals?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function toggleGoalCompleted(g: Goal) {
    await fetch("/api/goals", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: g.id, completed: !g.completed }),
    });
    fetchData();
  }

  const categoryColors: Record<string, string> = {
    study: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
    fitness: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    personal: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    general: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400",
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm transition-all input";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <h2 className="text-2xl font-bold text-[var(--text-primary)]">Habits & Goals</h2>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Habits */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-500/20">
                <Target size={18} className="text-amber-500" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Daily Habits</h3>
            </div>
            <button
              onClick={() => setShowHabitModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500 text-white text-sm font-medium hover:bg-amber-600 transition shadow-lg shadow-amber-500/25"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {habits.length === 0 ? (
            <div className="card p-10 text-center">
              <Target size={40} className="mx-auto text-[var(--text-tertiary)] mb-3" />
              <p className="text-[var(--text-tertiary)]">Create your first habit</p>
            </div>
          ) : (
            <div className="space-y-3">
              {habits.map((h, idx) => {
                const done = todayLogs.some((l) => l.habitId === h.id && l.completed);
                return (
                  <div key={h.id} className={`card p-4 animate-fade-in stagger-${Math.min(idx + 1, 5)}`}>
                    <div className="flex items-center gap-3">
                      <button onClick={() => toggleHabit(h.id)} className="shrink-0">
                        <div
                          className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl transition-all ${
                            done
                              ? "bg-amber-100 dark:bg-amber-500/20 ring-2 ring-amber-400"
                              : "bg-[var(--surface-tertiary)]"
                          }`}
                        >
                          {h.icon}
                        </div>
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className={`text-sm font-medium ${done ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"}`}>
                          {h.name}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-[var(--text-tertiary)] mt-0.5">
                          <span className="flex items-center gap-1 text-amber-500">
                            <Flame size={10} /> {h.currentStreak} day streak
                          </span>
                          <span className="flex items-center gap-1">
                            <Award size={10} /> Best: {h.longestStreak}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteHabit(h.id)}
                        className="p-2 rounded-xl text-[var(--text-tertiary)] hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-500 transition"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Goals */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/20">
                <TrendingUp size={18} className="text-brand-500" />
              </div>
              <h3 className="font-semibold text-[var(--text-primary)]">Goals & Milestones</h3>
            </div>
            <button
              onClick={() => setShowGoalModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg btn-primary text-sm"
            >
              <Plus size={14} /> Add
            </button>
          </div>

          {goals.length === 0 ? (
            <div className="card p-10 text-center">
              <TrendingUp size={40} className="mx-auto text-[var(--text-tertiary)] mb-3" />
              <p className="text-[var(--text-tertiary)]">Set your first goal</p>
            </div>
          ) : (
            <div className="space-y-3">
              {goals.map((g, idx) => (
                <div key={g.id} className={`card p-4 animate-fade-in stagger-${Math.min(idx + 1, 5)}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <button onClick={() => toggleGoalCompleted(g)}>
                        <CheckCircle2
                          size={20}
                          className={g.completed ? "text-emerald-500" : "text-[var(--text-tertiary)]"}
                        />
                      </button>
                      <span className={`text-sm font-semibold ${g.completed ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-primary)]"}`}>
                        {g.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors[g.category || "general"]}`}>
                        {g.category || "general"}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        g.type === "long_term"
                          ? "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400"
                      }`}>
                        {g.type === "long_term" ? "Long-term" : "Short-term"}
                      </span>
                      <button
                        onClick={() => deleteGoal(g.id)}
                        className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/20 text-[var(--text-tertiary)] hover:text-rose-500"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {g.description && (
                    <p className="text-xs text-[var(--text-tertiary)] mb-2 ml-7">{g.description}</p>
                  )}

                  <div className="ml-7 mb-2">
                    <div className="flex justify-between text-xs text-[var(--text-tertiary)] mb-1">
                      <span>Progress</span>
                      <span className="font-medium">{g.progress}%</span>
                    </div>
                    <div className="w-full bg-[var(--surface-tertiary)] rounded-full h-2">
                      <div className="bg-gradient-to-r from-brand-500 to-violet-500 rounded-full h-2 transition-all duration-500" style={{ width: `${g.progress}%` }} />
                    </div>
                  </div>

                  {g.milestones.length > 0 && (
                    <div className="ml-7 mt-3 space-y-1.5">
                      {g.milestones.map((m) => (
                        <button
                          key={m.id}
                          onClick={() => toggleMilestone(m)}
                          className="flex items-center gap-2 w-full text-left text-sm p-2 rounded-lg hover:bg-[var(--surface-tertiary)] transition"
                        >
                          <CheckCircle2
                            size={14}
                            className={m.status === "completed" ? "text-emerald-500" : "text-[var(--text-tertiary)]"}
                          />
                          <span className={m.status === "completed" ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-secondary)]"}>
                            {m.title}
                          </span>
                        </button>
                      ))}
                    </div>
                  )}

                  {g.targetDate && (
                    <div className="ml-7 mt-2 text-xs text-[var(--text-tertiary)] flex items-center gap-1">
                      <ChevronRight size={10} /> Target: {g.targetDate}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Habit Modal */}
      <Modal open={showHabitModal} onClose={() => setShowHabitModal(false)} title="Add Habit">
        <form onSubmit={addHabit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Habit Name</label>
            <input name="name" required className={inputClass} placeholder="e.g., Meditate 10 min" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Icon (emoji)</label>
              <input name="icon" className={inputClass} defaultValue="⭐" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Color</label>
              <input name="color" type="color" defaultValue="#6366f1" className="w-full h-10 rounded-xl cursor-pointer" />
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-amber-500 text-white font-medium text-sm hover:bg-amber-600 transition">
            Add Habit
          </button>
        </form>
      </Modal>

      {/* Goal Modal */}
      <Modal open={showGoalModal} onClose={() => { setShowGoalModal(false); setMilestoneInputs([""]); }} title="Add Goal">
        <form onSubmit={addGoal} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Goal Title</label>
            <input name="title" required className={inputClass} placeholder="e.g., Complete React course" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Description</label>
            <textarea name="description" className={inputClass} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
              <select name="type" className={inputClass}>
                <option value="short_term">Short-term</option>
                <option value="long_term">Long-term</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Category</label>
              <select name="category" className={inputClass}>
                <option value="general">General</option>
                <option value="study">Study</option>
                <option value="fitness">Fitness</option>
                <option value="personal">Personal</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Target Date</label>
            <input name="targetDate" type="date" className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Milestones</label>
            <div className="space-y-2">
              {milestoneInputs.map((val, i) => (
                <input
                  key={i}
                  value={val}
                  onChange={(e) => {
                    const newInputs = [...milestoneInputs];
                    newInputs[i] = e.target.value;
                    setMilestoneInputs(newInputs);
                  }}
                  className={inputClass}
                  placeholder={`Milestone ${i + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setMilestoneInputs([...milestoneInputs, ""])}
              className="mt-2 text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
            >
              + Add milestone
            </button>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl btn-primary text-sm font-medium">
            Create Goal
          </button>
        </form>
      </Modal>
    </div>
  );
}
