"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Droplets,
  Moon,
  Scale,
  Smile,
  Zap,
  Plus,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
} from "lucide-react";
import Modal from "./Modal";

interface HealthData {
  id: number;
  date: string;
  waterIntakeMl: number;
  waterGoalMl: number;
  sleepHours: number;
  sleepGoalHours: number;
  weight: number | null;
  mood: number | null;
  energyLevel: number | null;
  notes: string | null;
}

export default function HealthTracker() {
  const [currentDate, setCurrentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [data, setData] = useState<HealthData | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/health-metrics?date=${currentDate}`);
    const json = await res.json();
    setData(json);
    setLoading(false);
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

  async function addWater(amount: number) {
    await fetch("/api/health-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: currentDate,
        waterIntakeMl: (data?.waterIntakeMl || 0) + amount,
      }),
    });
    fetchData();
  }

  async function saveMetrics(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/health-metrics", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date: currentDate,
        waterIntakeMl: Number(fd.get("water")) || data?.waterIntakeMl || 0,
        waterGoalMl: Number(fd.get("waterGoal")) || 2500,
        sleepHours: Number(fd.get("sleep")) || 0,
        sleepGoalHours: Number(fd.get("sleepGoal")) || 8,
        weight: fd.get("weight") ? Number(fd.get("weight")) : null,
        mood: fd.get("mood") ? Number(fd.get("mood")) : null,
        energyLevel: fd.get("energy") ? Number(fd.get("energy")) : null,
        notes: fd.get("notes") || null,
      }),
    });
    setShowModal(false);
    fetchData();
  }

  const displayDate = new Date(currentDate + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const waterPercent = data
    ? Math.min(Math.round((data.waterIntakeMl / data.waterGoalMl) * 100), 100)
    : 0;
  const sleepPercent = data
    ? Math.min(Math.round((data.sleepHours / data.sleepGoalHours) * 100), 100)
    : 0;

  const getMoodEmoji = (mood: number | null) => {
    if (!mood) return "😐";
    const emojis = ["😞", "😕", "😐", "🙂", "😄"];
    return emojis[mood - 1] || "😐";
  };

  const getEnergyColor = (level: number | null) => {
    if (!level) return "bg-slate-300";
    const colors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-lime-400", "bg-emerald-400"];
    return colors[level - 1] || "bg-slate-300";
  };

  const inputClass =
    "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent input";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Health & Wellness</h2>
          <p className="text-sm text-[var(--text-tertiary)]">{displayDate}</p>
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
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm"
          >
            <Plus size={16} /> Log Metrics
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* Main Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Water Intake */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-sky-100 dark:bg-sky-500/20">
                  <Droplets size={20} className="text-sky-500" />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-tertiary)]">Water Intake</div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">
                    {((data?.waterIntakeMl || 0) / 1000).toFixed(1)}L
                    <span className="text-sm font-normal text-[var(--text-tertiary)]">
                      {" "}/ {((data?.waterGoalMl || 2500) / 1000).toFixed(1)}L
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[var(--surface-tertiary)] rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-sky-400 to-cyan-500 rounded-full h-3 transition-all duration-500"
                  style={{ width: `${waterPercent}%` }}
                />
              </div>

              {/* Quick add buttons */}
              <div className="flex gap-2">
                {[250, 500].map((ml) => (
                  <button
                    key={ml}
                    onClick={() => addWater(ml)}
                    className="flex-1 py-2 rounded-lg text-xs font-medium transition-all
                               bg-[var(--surface-tertiary)] text-[var(--text-secondary)] hover:bg-sky-100 hover:text-sky-600
                               dark:hover:bg-sky-500/20 dark:hover:text-sky-400"
                  >
                    +{ml}ml
                  </button>
                ))}
              </div>
            </div>

            {/* Sleep */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-violet-100 dark:bg-violet-500/20">
                  <Moon size={20} className="text-violet-500" />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-tertiary)]">Sleep</div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">
                    {data?.sleepHours || 0}h
                    <span className="text-sm font-normal text-[var(--text-tertiary)]">
                      {" "}/ {data?.sleepGoalHours || 8}h
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full bg-[var(--surface-tertiary)] rounded-full h-3 mb-4">
                <div
                  className="bg-gradient-to-r from-violet-400 to-purple-500 rounded-full h-3 transition-all duration-500"
                  style={{ width: `${sleepPercent}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className={`font-medium ${sleepPercent >= 100 ? "text-emerald-500" : "text-amber-500"}`}>
                  {sleepPercent >= 100 ? "Goal achieved! 🎉" : `${100 - sleepPercent}% to go`}
                </span>
                {data?.sleepHours && data.sleepHours < 6 && (
                  <span className="text-rose-500 flex items-center gap-1">
                    <TrendingDown size={12} /> Low
                  </span>
                )}
              </div>
            </div>

            {/* Weight */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-500/20">
                  <Scale size={20} className="text-emerald-500" />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-tertiary)]">Weight</div>
                  <div className="text-xl font-bold text-[var(--text-primary)]">
                    {data?.weight ? `${data.weight} kg` : "—"}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 p-3 rounded-lg bg-[var(--surface-tertiary)]">
                <TrendingUp size={16} className="text-emerald-500" />
                <span className="text-xs text-[var(--text-secondary)]">
                  {data?.weight ? "Track daily for trends" : "No data logged"}
                </span>
              </div>
            </div>

            {/* Mood & Energy */}
            <div className="card p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-500/20">
                  <Smile size={20} className="text-amber-500" />
                </div>
                <div>
                  <div className="text-sm text-[var(--text-tertiary)]">Mood & Energy</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-tertiary)]">
                  <span className="text-sm text-[var(--text-secondary)]">Mood</span>
                  <span className="text-2xl">{getMoodEmoji(data?.mood || null)}</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--surface-tertiary)]">
                  <span className="text-sm text-[var(--text-secondary)]">Energy</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((level) => (
                      <div
                        key={level}
                        className={`w-3 h-6 rounded-full transition-all ${
                          data?.energyLevel && level <= data.energyLevel
                            ? getEnergyColor(data.energyLevel)
                            : "bg-[var(--border-default)]"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Summary Card */}
          {data && (
            <div className="card p-6">
              <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
                <Zap size={18} className="text-amber-500" />
                Daily Summary
              </h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <SummaryItem
                  label="Hydration"
                  value={`${waterPercent}%`}
                  status={waterPercent >= 80 ? "good" : waterPercent >= 50 ? "warning" : "low"}
                />
                <SummaryItem
                  label="Rest"
                  value={`${sleepPercent}%`}
                  status={sleepPercent >= 90 ? "good" : sleepPercent >= 70 ? "warning" : "low"}
                />
                <SummaryItem
                  label="Mood"
                  value={data.mood ? `${data.mood}/5` : "—"}
                  status={data.mood ? (data.mood >= 4 ? "good" : data.mood >= 3 ? "warning" : "low") : "neutral"}
                />
                <SummaryItem
                  label="Energy"
                  value={data.energyLevel ? `${data.energyLevel}/5` : "—"}
                  status={data.energyLevel ? (data.energyLevel >= 4 ? "good" : data.energyLevel >= 3 ? "warning" : "low") : "neutral"}
                />
              </div>

              {data.notes && (
                <div className="mt-4 p-4 rounded-xl bg-[var(--surface-tertiary)]">
                  <div className="text-xs text-[var(--text-tertiary)] mb-1">Notes</div>
                  <p className="text-sm text-[var(--text-secondary)]">{data.notes}</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Log Health Metrics">
        <form onSubmit={saveMetrics} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Water (ml)</label>
              <input
                name="water"
                type="number"
                defaultValue={data?.waterIntakeMl || 0}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Water Goal (ml)</label>
              <input
                name="waterGoal"
                type="number"
                defaultValue={data?.waterGoalMl || 2500}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Sleep (hours)</label>
              <input
                name="sleep"
                type="number"
                step="0.5"
                defaultValue={data?.sleepHours || ""}
                className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Sleep Goal (hours)</label>
              <input
                name="sleepGoal"
                type="number"
                step="0.5"
                defaultValue={data?.sleepGoalHours || 8}
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Weight (kg)</label>
            <input
              name="weight"
              type="number"
              step="0.1"
              defaultValue={data?.weight || ""}
              placeholder="Optional"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Mood (1-5)</label>
              <select name="mood" defaultValue={data?.mood || ""} className={inputClass}>
                <option value="">Select...</option>
                <option value="1">😞 Very Low</option>
                <option value="2">😕 Low</option>
                <option value="3">😐 Okay</option>
                <option value="4">🙂 Good</option>
                <option value="5">😄 Great</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Energy (1-5)</label>
              <select name="energy" defaultValue={data?.energyLevel || ""} className={inputClass}>
                <option value="">Select...</option>
                <option value="1">Very Low</option>
                <option value="2">Low</option>
                <option value="3">Moderate</option>
                <option value="4">High</option>
                <option value="5">Very High</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Notes</label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={data?.notes || ""}
              placeholder="How are you feeling today?"
              className={inputClass}
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl btn-primary text-sm font-medium"
          >
            Save Metrics
          </button>
        </form>
      </Modal>
    </div>
  );
}

function SummaryItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "good" | "warning" | "low" | "neutral";
}) {
  const statusColors = {
    good: "text-emerald-500",
    warning: "text-amber-500",
    low: "text-rose-500",
    neutral: "text-[var(--text-tertiary)]",
  };

  return (
    <div className="p-3 rounded-xl bg-[var(--surface-tertiary)] text-center">
      <div className={`text-2xl font-bold ${statusColors[status]}`}>{value}</div>
      <div className="text-xs text-[var(--text-tertiary)]">{label}</div>
    </div>
  );
}
