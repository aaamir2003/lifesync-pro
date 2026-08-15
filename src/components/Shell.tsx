"use client";

import { ReactNode, useState } from "react";
import {
  LayoutDashboard,
  BookOpen,
  Dumbbell,
  Target,
  BarChart3,
  Menu,
  X,
  Flame,
  Heart,
  FileText,
  Sparkles,
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";

const navItems = [
  { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { key: "study", label: "Study Planner", icon: BookOpen },
  { key: "fitness", label: "Fitness", icon: Dumbbell },
  { key: "health", label: "Health", icon: Heart },
  { key: "habits", label: "Habits & Goals", icon: Target },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "reports", label: "Reports", icon: FileText },
];

interface ShellProps {
  active: string;
  onNavigate: (key: string) => void;
  children: ReactNode;
}

export default function Shell({ active, onNavigate, children }: ShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col transition-transform duration-300 ease-out lg:static lg:translate-x-0
                    bg-[var(--surface-primary)] border-r border-[var(--border-default)]
                    ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-[var(--border-subtle)]">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 via-violet-500 to-cyan-500 text-white shadow-lg">
            <Flame size={22} />
            <div className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-[var(--surface-primary)]" />
          </div>
          <div>
            <span className="text-lg font-bold gradient-text">LifeSync</span>
            <span className="text-lg font-bold text-[var(--text-primary)]"> Pro</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item, idx) => {
            const Icon = item.icon;
            const isActive = active === item.key;
            return (
              <button
                key={item.key}
                onClick={() => {
                  onNavigate(item.key);
                  setSidebarOpen(false);
                }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                           animate-fade-in stagger-${Math.min(idx + 1, 5)}
                           ${
                             isActive
                               ? "bg-gradient-to-r from-brand-500/10 to-violet-500/10 text-brand-600 dark:text-brand-400 shadow-sm border border-brand-200/50 dark:border-brand-500/20"
                               : "text-[var(--text-secondary)] hover:bg-[var(--surface-tertiary)] hover:text-[var(--text-primary)]"
                           }`}
              >
                <Icon size={18} className={isActive ? "text-brand-500" : ""} />
                {item.label}
                {isActive && (
                  <Sparkles size={12} className="ml-auto text-brand-400 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-[var(--border-subtle)]">
          <div className="flex items-center justify-between">
            <div className="text-xs text-[var(--text-tertiary)]">
              LifeSync Pro v2.0
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 bg-[var(--surface-secondary)]">
        {/* Top bar */}
        <header className="flex items-center justify-between px-4 md:px-6 py-3 border-b border-[var(--border-default)] bg-[var(--surface-primary)] shrink-0 no-print">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl transition-colors hover:bg-[var(--surface-tertiary)] text-[var(--text-secondary)]"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div>
              <h1 className="text-lg font-semibold text-[var(--text-primary)] capitalize">
                {navItems.find((i) => i.key === active)?.label ?? "Dashboard"}
              </h1>
              <p className="text-xs text-[var(--text-tertiary)] hidden sm:block">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle variant="dropdown" />
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
