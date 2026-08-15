"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  Printer,
  Download,
  Calendar,
  BookOpen,
  Dumbbell,
  Target,
  Activity,
  Heart,
  Flame,
  TrendingUp,
  Award,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts";

interface ReportData {
  period: { from: string; to: string };
  study: {
    totalMinutes: number;
    totalHours: number;
    totalSessions: number;
    totalPomodoros: number;
    avgMinutesPerDay: number;
    dailyData: Array<{ date: string; minutes: number; hours: number }>;
  };
  workouts: {
    total: number;
    completed: number;
    completionRate: number;
    byType: Record<string, number>;
  };
  habits: {
    total: number;
    completionRate: number;
    totalCompletions: number;
    topStreaks: Array<{ name: string; icon: string; streak: number; longestStreak: number }>;
  };
  activity: {
    totalSteps: number;
    totalActiveMinutes: number;
    totalCalories: number;
    avgStepsPerDay: number;
    dailyData: Array<{ date: string; steps: number; activeMinutes: number; calories: number }>;
  };
  health: {
    avgSleepHours: number;
    avgWaterMl: number;
    daysTracked: number;
  };
  goals: {
    total: number;
    completed: number;
    active: number;
    completionRate: number;
  };
  subjects: Array<{ name: string; color: string; progress: number; chapters: string }>;
}

export default function PrintableReport() {
  const [data, setData] = useState<ReportData | null>(null);
  const [period, setPeriod] = useState<"week" | "month">("week");
  const [loading, setLoading] = useState(true);
  const reportRef = useRef<HTMLDivElement>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const days = period === "week" ? 7 : 30;
    const from = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const to = new Date().toISOString().split("T")[0];
    const res = await fetch(`/api/reports?from=${from}&to=${to}`);
    setData(await res.json());
    setLoading(false);
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (d: unknown) => {
    if (typeof d !== "string") return String(d ?? "");
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  const formatFullDate = (d: string) => {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const workoutTypeData = Object.entries(data.workouts.byType).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#f43f5e", "#8b5cf6", "#06b6d4"];

  return (
    <div className="max-w-7xl mx-auto animate-fade-in">
      {/* Controls (hidden in print) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 no-print">
        <div>
          <h2 className="text-2xl font-bold text-[var(--text-primary)]">Reports & Export</h2>
          <p className="text-sm text-[var(--text-tertiary)]">
            Generate and print summary reports
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-tertiary)]">
            {(["week", "month"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  period === p
                    ? "bg-[var(--surface-primary)] text-brand-600 shadow-sm"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {p === "week" ? "Weekly" : "Monthly"}
              </button>
            ))}
          </div>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 text-white font-medium text-sm hover:bg-brand-700 transition shadow-lg shadow-brand-500/25"
          >
            <Printer size={16} />
            Print Report
          </button>
        </div>
      </div>

      {/* Printable Report Content */}
      <div ref={reportRef} className="space-y-6">
        {/* Print Header */}
        <div className="print-only print-header">
          <div className="flex items-center gap-3">
            <Flame size={24} />
            <div>
              <div className="text-xl font-bold">LifeSync Pro</div>
              <div className="text-sm text-gray-600">Personal Progress Report</div>
            </div>
          </div>
          <div className="text-right text-sm">
            <div className="font-medium">
              {formatFullDate(data.period.from)} — {formatFullDate(data.period.to)}
            </div>
            <div className="text-gray-500">Generated: {new Date().toLocaleDateString()}</div>
          </div>
        </div>

        {/* Summary Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 report-stat-grid">
          <StatCard
            icon={<BookOpen size={20} />}
            label="Study Hours"
            value={data.study.totalHours.toString()}
            sub={`${data.study.totalPomodoros} pomodoros`}
            color="sky"
          />
          <StatCard
            icon={<Dumbbell size={20} />}
            label="Workouts"
            value={`${data.workouts.completed}/${data.workouts.total}`}
            sub={`${data.workouts.completionRate}% completion`}
            color="emerald"
          />
          <StatCard
            icon={<Target size={20} />}
            label="Habits"
            value={`${data.habits.completionRate}%`}
            sub={`${data.habits.totalCompletions} check-ins`}
            color="amber"
          />
          <StatCard
            icon={<Activity size={20} />}
            label="Steps"
            value={data.activity.totalSteps.toLocaleString()}
            sub={`${data.activity.avgStepsPerDay.toLocaleString()} avg/day`}
            color="rose"
          />
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Study Hours Chart */}
          <div className="card p-5 report-section avoid-break">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <BookOpen size={16} className="text-sky-500 print-color" />
              Study Hours Trend
            </h3>
            {data.study.dailyData.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-10">
                No study data for this period
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={data.study.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                  <Tooltip
                    formatter={(value) => [`${value} min`, "Study Time"]}
                    labelFormatter={formatDate}
                    contentStyle={{
                      background: "var(--surface-primary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                    }}
                  />
                  <Bar dataKey="minutes" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Activity Chart */}
          <div className="card p-5 report-section avoid-break">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Activity size={16} className="text-rose-500 print-color" />
              Daily Activity
            </h3>
            {data.activity.dailyData.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-10">
                No activity data for this period
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={data.activity.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                  <XAxis
                    dataKey="date"
                    tickFormatter={formatDate}
                    tick={{ fontSize: 11, fill: "var(--text-tertiary)" }}
                  />
                  <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                  <Tooltip
                    labelFormatter={formatDate}
                    contentStyle={{
                      background: "var(--surface-primary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "8px",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="steps"
                    stroke="#f43f5e"
                    strokeWidth={2}
                    dot={false}
                    name="Steps"
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Workout Breakdown */}
          <div className="card p-5 report-section avoid-break">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Dumbbell size={16} className="text-emerald-500 print-color" />
              Workouts by Type
            </h3>
            {workoutTypeData.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-10">
                No workout data
              </p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={workoutTypeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {workoutTypeData.map((_, idx) => (
                      <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
            <div className="flex flex-wrap gap-2 mt-2 justify-center">
              {workoutTypeData.map((item, idx) => (
                <div key={item.name} className="flex items-center gap-1.5 text-xs">
                  <div
                    className="w-2.5 h-2.5 rounded-full print-color"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="text-[var(--text-secondary)]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top Habit Streaks */}
          <div className="card p-5 report-section avoid-break">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Flame size={16} className="text-amber-500 print-color" />
              Top Habit Streaks
            </h3>
            {data.habits.topStreaks.length === 0 ? (
              <p className="text-sm text-[var(--text-tertiary)] text-center py-10">
                No habits tracked
              </p>
            ) : (
              <div className="space-y-3">
                {data.habits.topStreaks.map((h, idx) => (
                  <div
                    key={h.name}
                    className="flex items-center gap-3 p-2 rounded-lg bg-[var(--surface-tertiary)]"
                  >
                    <span className="text-lg">{h.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {h.name}
                      </div>
                      <div className="text-xs text-[var(--text-tertiary)]">
                        Best: {h.longestStreak} days
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-500">{h.streak}</div>
                      <div className="text-xs text-[var(--text-tertiary)]">days</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Goals & Health Summary */}
          <div className="card p-5 report-section avoid-break">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <TrendingUp size={16} className="text-brand-500 print-color" />
              Goals & Health
            </h3>
            <div className="space-y-4">
              {/* Goals */}
              <div className="p-3 rounded-lg bg-[var(--surface-tertiary)]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-[var(--text-secondary)]">Goals Progress</span>
                  <span className="text-sm font-bold text-brand-500">
                    {data.goals.completed}/{data.goals.total}
                  </span>
                </div>
                <div className="w-full bg-[var(--surface-primary)] rounded-full h-2">
                  <div
                    className="bg-brand-500 rounded-full h-2 transition-all print-color"
                    style={{ width: `${data.goals.completionRate}%` }}
                  />
                </div>
              </div>

              {/* Health Stats */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-[var(--surface-tertiary)] text-center">
                  <Heart size={16} className="mx-auto text-rose-500 mb-1" />
                  <div className="text-lg font-bold text-[var(--text-primary)]">
                    {data.health.avgSleepHours}h
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">Avg Sleep</div>
                </div>
                <div className="p-3 rounded-lg bg-[var(--surface-tertiary)] text-center">
                  <Activity size={16} className="mx-auto text-sky-500 mb-1" />
                  <div className="text-lg font-bold text-[var(--text-primary)]">
                    {Math.round(data.health.avgWaterMl / 1000 * 10) / 10}L
                  </div>
                  <div className="text-xs text-[var(--text-tertiary)]">Avg Water</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Progress */}
        {data.subjects.length > 0 && (
          <div className="card p-5 report-section avoid-break">
            <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <Award size={16} className="text-violet-500 print-color" />
              Subject Progress
            </h3>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.subjects.map((s) => (
                <div key={s.name} className="p-3 rounded-lg bg-[var(--surface-tertiary)]">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-3 h-3 rounded-full print-color"
                      style={{ backgroundColor: s.color }}
                    />
                    <span className="text-sm font-medium text-[var(--text-primary)]">{s.name}</span>
                    <span className="ml-auto text-xs text-[var(--text-tertiary)]">
                      {s.chapters}
                    </span>
                  </div>
                  <div className="w-full bg-[var(--surface-primary)] rounded-full h-2">
                    <div
                      className="rounded-full h-2 transition-all print-color"
                      style={{ width: `${s.progress}%`, backgroundColor: s.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Print Footer */}
        <div className="print-only text-center text-xs text-gray-500 pt-4 border-t">
          <p>Generated by LifeSync Pro — Your Personal Command Center</p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  sub,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  color: string;
}) {
  const bgMap: Record<string, string> = {
    sky: "bg-sky-50 dark:bg-sky-500/10",
    emerald: "bg-emerald-50 dark:bg-emerald-500/10",
    amber: "bg-amber-50 dark:bg-amber-500/10",
    rose: "bg-rose-50 dark:bg-rose-500/10",
  };
  const textMap: Record<string, string> = {
    sky: "text-sky-600 dark:text-sky-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    amber: "text-amber-600 dark:text-amber-400",
    rose: "text-rose-600 dark:text-rose-400",
  };

  return (
    <div className="card p-4 report-stat-card">
      <div className={`inline-flex p-2 rounded-lg ${bgMap[color]} ${textMap[color]} mb-3 print-color`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
      <div className="text-sm font-medium text-[var(--text-secondary)]">{label}</div>
      <div className="text-xs text-[var(--text-tertiary)]">{sub}</div>
    </div>
  );
}
