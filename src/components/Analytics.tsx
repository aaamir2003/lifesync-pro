"use client";

import { useEffect, useState, useCallback } from "react";
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
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BookOpen,
  Dumbbell,
  Target,
  TrendingUp,
  Calendar,
} from "lucide-react";

interface AnalyticsData {
  studyByDate: Array<{ date: string; hours: number }>;
  workoutByDate: Array<{ date: string; count: number; completed: number }>;
  goalStats: { total: number; completed: number; rate: number };
  habitStats: { totalLogs: number; completedLogs: number; rate: number };
  activityData: Array<{
    date: string;
    steps: number;
    activeMinutes: number;
    caloriesBurned: number;
    stepsGoal: number;
  }>;
}

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [period, setPeriod] = useState<"7" | "14" | "30">("7");

  const fetchData = useCallback(async () => {
    const to = new Date().toISOString().split("T")[0];
    const from = new Date(Date.now() - parseInt(period) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];
    const res = await fetch(`/api/analytics?from=${from}&to=${to}`);
    setData(await res.json());
  }, [period]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (!data)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-3 border-brand-500 border-t-transparent rounded-full" />
      </div>
    );

  const formatDateLabel = (d: unknown) => {
    if (typeof d !== "string") return String(d ?? "");
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const pieData = [
    { name: "Completed", value: data.goalStats.completed, color: "#10b981" },
    { name: "Remaining", value: Math.max(data.goalStats.total - data.goalStats.completed, 0), color: "var(--border-default)" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analytics & Insights</h2>
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[var(--surface-tertiary)]">
          {(["7", "14", "30"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                period === p
                  ? "bg-[var(--surface-primary)] text-brand-600 dark:text-brand-400 shadow-sm"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-primary)]"
              }`}
            >
              {p}D
            </button>
          ))}
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<BookOpen size={18} />}
          label="Study Hours"
          value={data.studyByDate.reduce((a, b) => a + b.hours, 0).toFixed(1)}
          sub={`Last ${period} days`}
          color="sky"
        />
        <StatCard
          icon={<Dumbbell size={18} />}
          label="Workouts"
          value={String(data.workoutByDate.reduce((a, b) => a + Number(b.completed), 0))}
          sub={`Completed`}
          color="emerald"
        />
        <StatCard
          icon={<Target size={18} />}
          label="Goal Rate"
          value={`${data.goalStats.rate}%`}
          sub={`${data.goalStats.completed}/${data.goalStats.total}`}
          color="brand"
        />
        <StatCard
          icon={<TrendingUp size={18} />}
          label="Habit Rate"
          value={`${data.habitStats.rate}%`}
          sub={`${data.habitStats.completedLogs} check-ins`}
          color="amber"
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Study Hours Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <BookOpen size={16} className="text-sky-500" /> Study Hours Over Time
          </h3>
          {data.studyByDate.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-10">No study data in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={data.studyByDate}>
                <defs>
                  <linearGradient id="studyGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <Tooltip
                  formatter={(value) => [`${Number(value).toFixed(1)} hrs`, "Study"]}
                  labelFormatter={formatDateLabel}
                  contentStyle={{
                    background: "var(--surface-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "12px",
                  }}
                />
                <Area type="monotone" dataKey="hours" stroke="#0ea5e9" fill="url(#studyGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Workout Frequency Chart */}
        <div className="card p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Dumbbell size={16} className="text-emerald-500" /> Workout Frequency
          </h3>
          {data.workoutByDate.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-10">No workout data in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data.workoutByDate}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} allowDecimals={false} />
                <Tooltip
                  formatter={(value, name) => [Number(value), name === "completed" ? "Completed" : "Total"]}
                  labelFormatter={formatDateLabel}
                  contentStyle={{
                    background: "var(--surface-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="count" fill="#d1fae5" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Completed" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Goal Completion Pie */}
        <div className="card p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Target size={16} className="text-brand-500" /> Goal Completion
          </h3>
          {data.goalStats.total === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-10">No goals set yet</p>
          ) : (
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: "var(--surface-primary)",
                      border: "1px solid var(--border-default)",
                      borderRadius: "12px",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Activity Trends */}
        <div className="card p-5">
          <h3 className="font-semibold text-[var(--text-primary)] mb-4 flex items-center gap-2">
            <Calendar size={16} className="text-rose-500" /> Activity Trends
          </h3>
          {data.activityData.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-10">No activity data in this period</p>
          ) : (
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data.activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="date" tickFormatter={formatDateLabel} tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <YAxis tick={{ fontSize: 11, fill: "var(--text-tertiary)" }} />
                <Tooltip
                  labelFormatter={formatDateLabel}
                  contentStyle={{
                    background: "var(--surface-primary)",
                    border: "1px solid var(--border-default)",
                    borderRadius: "12px",
                  }}
                />
                <Line type="monotone" dataKey="steps" stroke="#6366f1" strokeWidth={2} dot={false} name="Steps" />
                <Line type="monotone" dataKey="caloriesBurned" stroke="#f43f5e" strokeWidth={2} dot={false} name="Calories" />
              </LineChart>
            </ResponsiveContainer>
          )}
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
    brand: "bg-brand-50 dark:bg-brand-500/10",
    amber: "bg-amber-50 dark:bg-amber-500/10",
  };
  const textMap: Record<string, string> = {
    sky: "text-sky-600 dark:text-sky-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    brand: "text-brand-600 dark:text-brand-400",
    amber: "text-amber-600 dark:text-amber-400",
  };

  return (
    <div className="card p-4">
      <div className={`inline-flex p-2 rounded-xl ${bgMap[color]} ${textMap[color]} mb-3`}>
        {icon}
      </div>
      <div className="text-2xl font-bold text-[var(--text-primary)]">{value}</div>
      <div className="text-sm font-medium text-[var(--text-secondary)]">{label}</div>
      <div className="text-xs text-[var(--text-tertiary)]">{sub}</div>
    </div>
  );
}
