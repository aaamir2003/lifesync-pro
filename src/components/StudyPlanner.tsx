"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import {
  BookOpen,
  Plus,
  Play,
  Pause,
  RotateCcw,
  Trash2,
  Clock,
  GraduationCap,
  ChevronUp,
  CheckSquare,
  Square,
  AlertCircle,
} from "lucide-react";
import Modal from "./Modal";

interface Subject {
  id: number;
  name: string;
  color: string;
  priority: string;
  totalChapters: number;
  completedChapters: number;
  examDate: string | null;
  deadline: string | null;
}

interface StudyTask {
  id: number;
  sessionId: number;
  title: string;
  completed: boolean;
}

interface StudySession {
  id: number;
  subjectId: number | null;
  title: string;
  priority: string;
  durationMinutes: number;
  completedMinutes: number;
  pomodoroCount: number;
  date: string;
  notes: string | null;
}

export default function StudyPlanner() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [tasks, setTasks] = useState<Record<number, StudyTask[]>>({});
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [activeTimer, setActiveTimer] = useState<{ sessionId: number; secondsLeft: number; running: boolean } | null>(null);
  const [expandedSession, setExpandedSession] = useState<number | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const fetchData = useCallback(async () => {
    const [subRes, sesRes] = await Promise.all([
      fetch("/api/subjects"),
      fetch(`/api/study-sessions?from=${today}&to=${today}`),
    ]);
    setSubjects(await subRes.json());
    setSessions(await sesRes.json());
  }, [today]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch tasks for expanded session
  useEffect(() => {
    if (expandedSession) {
      fetch(`/api/study-tasks?sessionId=${expandedSession}`)
        .then((r) => r.json())
        .then((data) => setTasks((prev) => ({ ...prev, [expandedSession]: data })));
    }
  }, [expandedSession]);

  // Timer logic
  useEffect(() => {
    if (activeTimer?.running && activeTimer.secondsLeft > 0) {
      timerRef.current = setInterval(() => {
        setActiveTimer((prev) => {
          if (!prev || !prev.running) return prev;
          if (prev.secondsLeft <= 1) {
            savePomodoroComplete(prev.sessionId);
            return { ...prev, secondsLeft: 0, running: false };
          }
          return { ...prev, secondsLeft: prev.secondsLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeTimer?.running, activeTimer?.sessionId]);

  async function savePomodoroComplete(sessionId: number) {
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return;
    await fetch("/api/study-sessions", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: sessionId,
        completedMinutes: session.completedMinutes + 25,
        pomodoroCount: session.pomodoroCount + 1,
      }),
    });
    fetchData();
  }

  function startPomodoro(sessionId: number) {
    setActiveTimer({ sessionId, secondsLeft: 25 * 60, running: true });
  }

  function toggleTimer() {
    if (!activeTimer) return;
    setActiveTimer({ ...activeTimer, running: !activeTimer.running });
  }

  function resetTimer() {
    setActiveTimer(null);
  }

  async function addSubject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/subjects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: fd.get("name"),
        color: fd.get("color"),
        priority: fd.get("priority"),
        totalChapters: Number(fd.get("totalChapters")),
        examDate: fd.get("examDate") || null,
        deadline: fd.get("deadline") || null,
      }),
    });
    setShowSubjectModal(false);
    fetchData();
  }

  async function addSession(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await fetch("/api/study-sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: fd.get("title"),
        subjectId: fd.get("subjectId") ? Number(fd.get("subjectId")) : null,
        priority: fd.get("priority"),
        durationMinutes: Number(fd.get("duration")),
        date: today,
        notes: fd.get("notes") || null,
      }),
    });
    setShowSessionModal(false);
    fetchData();
  }

  async function addTask(sessionId: number) {
    if (!newTaskTitle.trim()) return;
    await fetch("/api/study-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        title: newTaskTitle,
      }),
    });
    setNewTaskTitle("");
    const data = await fetch(`/api/study-tasks?sessionId=${sessionId}`).then((r) => r.json());
    setTasks((prev) => ({ ...prev, [sessionId]: data }));
  }

  async function toggleTask(task: StudyTask) {
    await fetch("/api/study-tasks", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: task.id, completed: !task.completed }),
    });
    const data = await fetch(`/api/study-tasks?sessionId=${task.sessionId}`).then((r) => r.json());
    setTasks((prev) => ({ ...prev, [task.sessionId]: data }));
  }

  async function deleteSession(id: number) {
    await fetch(`/api/study-sessions?id=${id}`, { method: "DELETE" });
    if (activeTimer?.sessionId === id) setActiveTimer(null);
    fetchData();
  }

  async function deleteSubject(id: number) {
    await fetch(`/api/subjects?id=${id}`, { method: "DELETE" });
    fetchData();
  }

  async function incrementChapter(sub: Subject) {
    if (sub.completedChapters >= sub.totalChapters) return;
    await fetch("/api/subjects", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: sub.id, completedChapters: sub.completedChapters + 1 }),
    });
    fetchData();
  }

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, "0")}:${String(sec).padStart(2, "0")}`;
  };

  const priorityColors: Record<string, string> = {
    low: "bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
    medium: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-400",
    high: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400",
    urgent: "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-400",
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm transition-all input";

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Study Planner</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSubjectModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-primary text-sm"
          >
            <Plus size={16} /> Subject
          </button>
          <button
            onClick={() => setShowSessionModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-500 text-white text-sm font-medium hover:bg-sky-600 transition shadow-lg shadow-sky-500/25"
          >
            <Plus size={16} /> Session
          </button>
        </div>
      </div>

      {/* Pomodoro Timer */}
      {activeTimer && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-brand-600 via-violet-600 to-brand-700 p-6 text-white text-center shadow-xl">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="relative z-10">
            <div className="text-sm font-medium opacity-80 mb-1">Pomodoro Timer</div>
            <div className="text-5xl font-mono font-bold mb-4 tracking-wider">
              {formatTime(activeTimer.secondsLeft)}
            </div>
            <div className="flex justify-center gap-3">
              <button
                onClick={toggleTimer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition backdrop-blur-sm"
              >
                {activeTimer.running ? <Pause size={16} /> : <Play size={16} />}
                {activeTimer.running ? "Pause" : "Resume"}
              </button>
              <button
                onClick={resetTimer}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-sm font-medium transition backdrop-blur-sm"
              >
                <RotateCcw size={16} /> Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Subjects */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-500/20">
              <GraduationCap size={18} className="text-brand-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Subjects & Progress</h3>
          </div>
          {subjects.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No subjects added yet</p>
          ) : (
            <div className="space-y-3">
              {subjects.map((sub, idx) => {
                const pct = sub.totalChapters > 0 ? Math.round((sub.completedChapters / sub.totalChapters) * 100) : 0;
                return (
                  <div key={sub.id} className={`p-4 rounded-xl bg-[var(--surface-tertiary)] animate-fade-in stagger-${Math.min(idx + 1, 5)}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: sub.color }} />
                        <span className="text-sm font-medium text-[var(--text-primary)]">{sub.name}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[sub.priority] || priorityColors.medium}`}>
                          {sub.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => incrementChapter(sub)}
                          className="p-1 rounded hover:bg-[var(--surface-primary)] text-[var(--text-tertiary)]"
                          title="Mark chapter complete"
                        >
                          <ChevronUp size={14} />
                        </button>
                        <button
                          onClick={() => deleteSubject(sub.id)}
                          className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-500/20 text-[var(--text-tertiary)] hover:text-rose-500"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                    <div className="w-full bg-[var(--surface-primary)] rounded-full h-2 mb-1.5">
                      <div
                        className="rounded-full h-2 transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: sub.color }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
                      <span>{sub.completedChapters}/{sub.totalChapters} chapters</span>
                      {sub.examDate && (
                        <span className="flex items-center gap-1">
                          <AlertCircle size={10} /> Exam: {sub.examDate}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Today's Sessions */}
        <div className="card p-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-500/20">
              <BookOpen size={18} className="text-sky-500" />
            </div>
            <h3 className="font-semibold text-[var(--text-primary)]">Today&apos;s Sessions</h3>
          </div>
          {sessions.length === 0 ? (
            <p className="text-sm text-[var(--text-tertiary)] text-center py-6">No sessions today</p>
          ) : (
            <div className="space-y-3">
              {sessions.map((s, idx) => {
                const pct = s.durationMinutes > 0 ? Math.round((s.completedMinutes / s.durationMinutes) * 100) : 0;
                const isActive = activeTimer?.sessionId === s.id;
                const isExpanded = expandedSession === s.id;
                const sessionTasks = tasks[s.id] || [];
                return (
                  <div key={s.id} className={`rounded-xl transition-all animate-fade-in stagger-${Math.min(idx + 1, 5)} ${isActive ? "bg-brand-50 dark:bg-brand-500/10 border border-brand-200 dark:border-brand-500/30" : "bg-[var(--surface-tertiary)]"}`}>
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-[var(--text-primary)]">{s.title}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[s.priority] || priorityColors.medium}`}>
                            {s.priority}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          {!isActive && (
                            <button
                              onClick={() => startPomodoro(s.id)}
                              className="p-1.5 rounded-lg bg-brand-100 dark:bg-brand-500/20 text-brand-600 dark:text-brand-400 hover:bg-brand-200 transition"
                              title="Start Pomodoro"
                            >
                              <Play size={12} />
                            </button>
                          )}
                          <button
                            onClick={() => setExpandedSession(isExpanded ? null : s.id)}
                            className="p-1.5 rounded-lg hover:bg-[var(--surface-primary)] text-[var(--text-tertiary)]"
                            title="Tasks"
                          >
                            <CheckSquare size={12} />
                          </button>
                          <button
                            onClick={() => deleteSession(s.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-500/20 text-[var(--text-tertiary)] hover:text-rose-500"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="w-full bg-[var(--surface-primary)] rounded-full h-1.5 mb-1.5">
                        <div className="bg-sky-500 rounded-full h-1.5 transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between text-xs text-[var(--text-tertiary)]">
                        <span className="flex items-center gap-1"><Clock size={10} /> {s.completedMinutes}/{s.durationMinutes} min</span>
                        <span>🍅 {s.pomodoroCount} pomodoros</span>
                      </div>
                    </div>

                    {/* Expandable Tasks */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-[var(--border-subtle)]">
                        <div className="pt-3 space-y-2">
                          {sessionTasks.map((task) => (
                            <button
                              key={task.id}
                              onClick={() => toggleTask(task)}
                              className="flex items-center gap-2 w-full text-left text-sm p-2 rounded-lg hover:bg-[var(--surface-primary)] transition"
                            >
                              {task.completed ? (
                                <CheckSquare size={14} className="text-emerald-500" />
                              ) : (
                                <Square size={14} className="text-[var(--text-tertiary)]" />
                              )}
                              <span className={task.completed ? "text-[var(--text-tertiary)] line-through" : "text-[var(--text-secondary)]"}>
                                {task.title}
                              </span>
                            </button>
                          ))}
                          <div className="flex gap-2">
                            <input
                              value={newTaskTitle}
                              onChange={(e) => setNewTaskTitle(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && addTask(s.id)}
                              placeholder="Add subtask..."
                              className="flex-1 px-2 py-1.5 text-sm rounded-lg bg-[var(--surface-primary)] border border-[var(--border-default)] focus:outline-none focus:ring-1 focus:ring-brand-500"
                            />
                            <button
                              onClick={() => addTask(s.id)}
                              className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium hover:bg-brand-600 transition"
                            >
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Subject Modal */}
      <Modal open={showSubjectModal} onClose={() => setShowSubjectModal(false)} title="Add Subject">
        <form onSubmit={addSubject} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Subject Name</label>
            <input name="name" required className={inputClass} placeholder="e.g., Mathematics" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Color</label>
              <input name="color" type="color" defaultValue="#6366f1" className="w-full h-10 rounded-xl cursor-pointer" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Priority</label>
              <select name="priority" className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Total Chapters</label>
            <input name="totalChapters" type="number" defaultValue={10} min={1} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Exam Date</label>
              <input name="examDate" type="date" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Deadline</label>
              <input name="deadline" type="date" className={inputClass} />
            </div>
          </div>
          <button type="submit" className="w-full py-3 rounded-xl btn-primary text-sm font-medium">
            Add Subject
          </button>
        </form>
      </Modal>

      {/* Session Modal */}
      <Modal open={showSessionModal} onClose={() => setShowSessionModal(false)} title="Add Study Session">
        <form onSubmit={addSession} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Title</label>
            <input name="title" required className={inputClass} placeholder="e.g., Chapter 5 review" />
          </div>
          <div className="grid grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Priority</label>
              <select name="priority" className={inputClass}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Duration (minutes)</label>
            <input name="duration" type="number" defaultValue={25} min={5} className={inputClass} />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--text-secondary)] mb-1.5">Notes</label>
            <textarea name="notes" className={inputClass} rows={2} placeholder="Optional notes..." />
          </div>
          <button type="submit" className="w-full py-3 rounded-xl bg-sky-500 text-white font-medium text-sm hover:bg-sky-600 transition">
            Add Session
          </button>
        </form>
      </Modal>
    </div>
  );
}
