"use client";

import { useState } from "react";

export const dynamic = "force-dynamic";
import Shell from "@/components/Shell";
import Dashboard from "@/components/Dashboard";
import StudyPlanner from "@/components/StudyPlanner";
import FitnessPlanner from "@/components/FitnessPlanner";
import HealthTracker from "@/components/HealthTracker";
import HabitsGoals from "@/components/HabitsGoals";
import Analytics from "@/components/Analytics";
import PrintableReport from "@/components/PrintableReport";

export default function Home() {
  const [active, setActive] = useState("dashboard");

  return (
    <Shell active={active} onNavigate={setActive}>
      {active === "dashboard" && <Dashboard />}
      {active === "study" && <StudyPlanner />}
      {active === "fitness" && <FitnessPlanner />}
      {active === "health" && <HealthTracker />}
      {active === "habits" && <HabitsGoals />}
      {active === "analytics" && <Analytics />}
      {active === "reports" && <PrintableReport />}
    </Shell>
  );
}
