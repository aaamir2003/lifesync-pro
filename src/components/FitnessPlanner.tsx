"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Dumbbell,
  Plus,
  Trash2,
  CheckCircle2,
  Footprints,
  Clock,
  Flame,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Modal from "./Modal";

interface Exercise {
  id: number;
  workoutId: number;
  name: string;
  sets: number;
  reps: number;
  weight: number;
  durationMinutes: number;
  caloriesBurned: number;
  completed: boolean;
}

interface Workout {
  id: number;
  name: string;
  type: string;
  scheduledDate: string;
  completed: boolean;
  notes: string | null;
  exercises: Exercise[];
}

interface Activity {
  id: number;
  date: string;
  steps: number;
  activeMinutes: number;
  caloriesBurned: number;
  stepsGoal: number;
  activeMinutesGoal: number;
  caloriesGoal: number;
}

export default function FitnessPlanner() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [activity, setActivity] = useState<Activity | null>(null);
  const [showWorkoutModal, setShowWorkoutModal] = useState(false);
  const [showExerciseModal, setShowExerciseModal] = useState<number | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const fetchData = useCallback(async () => {
    const [wRes, aRes] = await Promise.all([
      fetch(`/api/workouts?from=${currentDate}&to=${currentDate}`),
      fetch(`/api/daily-activity?date=${currentDate}`),
    ]);
    setWorkouts(await wRes.json());
    const activityData = await aRes.json();
    setActivity(activityData);
  }, [currentDate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  async function addWorkout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/workouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        type: fd.get("type"),
        scheduledDate: currentDate,
        notes: fd.get("notes") || null,
      }),
    });
    setShowWorkoutModal(false);
    fetchData();
  }

  async function addExercise(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/exercises", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workoutId: showExerciseModal,
        name: fd.get("name"),
        sets: Number(fd.get("sets")),
        reps: Number(fd.get("reps")),
        weight: Number(fd.get("weight")),
        durationMinutes: Number(fd.get("duration")),
        caloriesBurned: Number(fd.get("calories")),
      }),
    });
    setShowExerciseModal(null);
    fetchData();
  }

  async function toggleWorkout(id: number, completed: boolean) {
    await fetch("/api/workouts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, completed: !completed }),
    });
    fetchData();
  }

  async function toggleExercise(ex: Exercise) {
    await fetch("/api/exercises", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: ex.id, completed: !ex.completed }),
    });
    fetchData();
  }

  async function deleteWorkout(id: number) {
    await fetch(`/api/workouts?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function deleteExercise(id: number) {
    await fetch(`/api/exercises?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function saveActivity(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/daily-activity", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: currentDate,
        steps: Number(fd.get("steps")),
        activeMinutes: Number(fd.get("activeMinutes")),
        caloriesBurned: Number(fd.get("caloriesBurned")),
        stepsGoal: Number(fd.get("stepsGoal")),
        activeMinutesGoal: Number(fd.get("activeMinutesGoal")),
        caloriesGoal: Number(fd.get("caloriesGoal")),
      }),
    });
    setShowActivityModal(false);
    fetchData();
  }

  const displayDate = new Date(currentDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const workoutTypeColors: Record<string, string> = {
    strength: "bg-brand-100 text-brand-700 dark:bg-brand-500/20 dark:text-brand-400",
    cardio: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
    flexibility: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    yoga: "bg-violet-100 text-violet-700 dark:bg-violet-500/20 dark:text-violet-400",
    running: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
    swimming: "bg-cyan-100 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-400",
    sports: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400",
    other: "bg-slate-100 text-slate-700 dark:bg-slate-500/20 dark:text-slate-400",
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm transition-all input";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Fitness Planner</h2>
          <p className="text-sm text-[var(--text-tertiary)]">{displayDate}</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prevDay} className="p-2 rounded-xl card hover:shadow-md text-[var(--text-secondary)]">
            <ChevronLeft size={16} />
          </button>
          <button onClick={() => setCurrentDate(new Date().toISOString().split("T")[0])} className="px-4 py-2 rounded-xl text-sm font-medium card hover:shadow-md">
            Today
          </button>
          <button onClick={nextDay} className="p-2 rounded-xl card hover:shadow-md text-[var(--text-secondary)]">
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Activity Card */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-500/20">
              <Flame size={18} className="text-rose-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Daily Activity</h3>
          </div>
          <button
            onClick={() => setShowActivityModal(true)}
            className="text-sm text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium"
          >
            {activity ? "Update" : "Log Activity"}
          </button>
        </div>
        {activity ? (
          <div className="grid grid-cols-3 gap-4">
            <ActivityCard
              icon={<Footprints size={20} />}
              label="Steps"
              value={activity.steps}
              goal={activity.stepsGoal}
              color="brand"
            />
            <ActivityCard
              icon={<Clock size={20} />}
              label="Active Min"
              value={activity.activeMinutes}
              goal={activity.activeMinutesGoal}
              color="emerald"
            />
            <ActivityCard
              icon={<Flame size={20} />}
              label="Calories"
              value={Math.round(activity.caloriesBurned)}
              goal={Math.round(activity.caloriesGoal)}
              color="rose"
            />
          </div>
        ) : (
          <p className="text-sm text-[var(--text-tertiary)] text-center py-4">No activity data — click &quot;Log Activity&quot; to add</p>
        )}
      </div>

      {/* Workouts */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-[var(--text-primary)]">Workouts</h3>
        <button
          onClick={() => setShowWorkoutModal(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white text-sm font-medium hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/25"
        >
          <Plus size={16} /> Add Workout
        </button>
      </div>

      {workouts.length === 0 ? (
        <div className="card p-10 text-center">
          <Dumbbell size={40} className="mx-auto text-[var(--text-tertiary)] mb-3" />
          <p className="text-[var(--text-tertiary)]">No workouts scheduled for this day</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workouts.map((w, idx) => (
            <div key={w.id} className={`card p-5 animate-fade-in stagger-${Math.min(idx + 1, 5)}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <button onClick={() => toggleWorkout(w.id, w.completed)}>
                    <CheckCircle2 size={22} className={w.completed ? "text-emerald-500" : "text-[var(--text-tertiary)]"} />
                  </button>
                  <div>
                    <span className={`text-sm font-semibold ${w.completed ? "line-through text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"}`}>{w.name}</span>
                    <span className={`ml-2 text-xs px-2 py-0.5 rounded-full ${workoutTypeColors[w.type] || workoutTypeColors.other}`}>
                      {w.type}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => setShowExerciseModal(w.id)} className="p-1.5 rounded-lg text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition" title="Add exercise">
                    <Plus size={16} />
                  </button>
                  <button onClick={() => deleteWorkout(w.id)} className="p-1.5 rounded-lg text-[var(--text-tertiary)] hover:bg-rose-50 dark:hover:bg-rose-500/20 hover:text-rose-500 transition">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {w.exercises.length > 0 && (
                <div className="ml-8 space-y-2">
                  {w.exercises.map((ex) => (
                    <div key={ex.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--surface-tertiary)]">
                      <button onClick={() => toggleExercise(ex)}>
                        <CheckCircle2 size={16} className={ex.completed ? "text-emerald-500" : "text-[var(--text-tertiary)]"} />
                      </button>
                      <div className="flex-1">
                        <div className={`text-sm ${ex.completed ? "line-through text-[var(--text-tertiary)]" : "text-[var(--text-primary)]"}`}>{ex.name}</div>
                        <div className="text-xs text-[var(--text-tertiary)] space-x-2">
                          {(ex.sets > 0 || ex.reps > 0) && <span>{ex.sets}×{ex.reps}</span>}
                          {ex.weight > 0 && <span>{ex.weight}kg</span>}
                          {ex.durationMinutes > 0 && <span>{ex.durationMinutes}min</span>}
                          {ex.caloriesBurned > 0 && <span>{ex.caloriesBurned}cal</span>}
                        </div>
                      </div>
                      <button onClick={() => deleteExercise(ex.id)} className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/20 text-[var(--text-tertiary)] hover:text-rose-500">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Workout Modal */}
      <Modal open={showWorkoutModal} onClose={() => setShowWorkoutModal(false)} title="Add Workout">
        <form onSubmit={addWorkout} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Name</label>
            <input name="name" required className={inputClass} placeholder="e.g., Upper Body Strength" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Type</label>
            <select name="type" className={inputClass}>
              <option value="strength">Strength</option>
              <option value="cardio">Cardio</option>
              <option value="flexibility">Flexibility</option>
              <option value="yoga">Yoga</option>
              <option value="running">Running</option>
              <option value="swimming">Swimming</option>
              <option value="sports">Sports</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Notes</label>
            <textarea name="notes" className={inputClass} rows={2} />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-emerald-500 text-white font-medium text-sm hover:bg-emerald-600 transition">
            Add Workout
          </button>
        </form>
      </Modal>

      {/* Exercise Modal */}
      <Modal open={showExerciseModal !== null} onClose={() => setShowExerciseModal(null)} title="Add Exercise">
        <form onSubmit={addExercise} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Exercise Name</label>
            <input name="name" required className={inputClass} placeholder="e.g., Bench Press" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Sets</label>
              <input name="sets" type="number" defaultValue={3} min={0} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Reps</label>
              <input name="reps" type="number" defaultValue={10} min={0} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Weight (kg)</label>
              <input name="weight" type="number" step="0.5" defaultValue={0} min={0} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Duration (min)</label>
              <input name="duration" type="number" defaultValue={0} min={0} className={inputClass} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Calories Burned</label>
            <input name="calories" type="number" defaultValue={0} min={0} className={inputClass} />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl btn-primary text-sm font-medium">
            Add Exercise
          </button>
        </form>
      </Modal>

      {/* Activity Modal */}
      <Modal open={showActivityModal} onClose={() => setShowActivityModal(false)} title="Log Daily Activity">
        <form onSubmit={saveActivity} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Steps</label>
              <input name="steps" type="number" defaultValue={activity?.steps ?? 0} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Steps Goal</label>
              <input name="stepsGoal" type="number" defaultValue={activity?.stepsGoal ?? 10000} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Active Minutes</label>
              <input name="activeMinutes" type="number" defaultValue={activity?.activeMinutes ?? 0} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Active Min Goal</label>
              <input name="activeMinutesGoal" type="number" defaultValue={activity?.activeMinutesGoal ?? 30} className={inputClass} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Calories Burned</label>
              <input name="caloriesBurned" type="number" defaultValue={activity?.caloriesBurned ?? 0} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Calories Goal</label>
              <input name="caloriesGoal" type="number" defaultValue={activity?.caloriesGoal ?? 500} className={inputClass} />
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-rose-500 text-white font-medium text-sm hover:bg-rose-600 transition">
            Save Activity
          </button>
        </form>
      </Modal>
    </div>
  );
}

function ActivityCard({ icon, label, value, goal, color }: {
  icon: React.ReactNode;
  label: string;
  value: number;
  goal: number;
  color: string;
}) {
  const pct = goal > 0 ? Math.min(Math.round((value / goal) * 100), 100) : 0;
  const bgMap: Record<string, string> = {
    brand: "bg-brand-50 dark:bg-brand-500/10",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10",
    rose: "bg-rose-50 dark:bg-rose-500/10",
  };
  const barMap: Record<string, string> = {
    brand: "bg-gradient-to-r from-brand-400 to-brand-600",
    emerald: "bg-gradient-to-r from-emerald-400 to-emerald-600",
    rose: "bg-gradient-to-r from-rose-400 to-rose-600",
  };
  const textMap: Record<string, string> = {
    brand: "text-brand-600 dark:text-brand-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    rose: "text-rose-600 dark:text-rose-400",
  };

  return (
    <div className={`${bgMap[color]} rounded-xl p-4`}>
      <div className={`${textMap[color]} mb-2`}>{icon}</div>
      <div className="text-xl font-bold text-[var(--text-primary)]">{value.toLocaleString()}</div>
      <div className="text-xs text-[var(--text-tertiary)] mb-2">/ {goal.toLocaleString()} {label}</div>
      <div className="w-full bg-[var(--surface-primary)] rounded-full h-1.5">
        <div className={`${barMap[color]} rounded-full h-1.5 transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
