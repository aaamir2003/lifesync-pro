import { db } from "@/db";
import { badges, userBadges, habits, goals } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

// Get all badges with earned status
export async function GET() {
  const allBadges = await db.select().from(badges);
  const earned = await db.select().from(userBadges);
  const earnedIds = new Set(earned.map((e) => e.badgeId));

  const result = allBadges.map((b) => ({
    ...b,
    earned: earnedIds.has(b.id),
    earnedAt: earned.find((e) => e.badgeId === b.id)?.earnedAt || null,
  }));

  return NextResponse.json(result);
}

// Check and award badges based on current stats
export async function POST() {
  // Get current stats
  const allHabits = await db.select().from(habits);
  const allGoals = await db.select().from(goals);
  const completedGoals = allGoals.filter((g) => g.completed);

  const maxStreak = Math.max(...allHabits.map((h) => h.currentStreak), 0);
  const totalCompletions = allHabits.reduce((a, h) => a + h.totalCompletions, 0);

  const allBadges = await db.select().from(badges);
  const earnedBadges = await db.select().from(userBadges);
  const earnedIds = new Set(earnedBadges.map((e) => e.badgeId));

  const newlyEarned: typeof allBadges = [];

  for (const badge of allBadges) {
    if (earnedIds.has(badge.id)) continue;

    let earned = false;

    switch (badge.type) {
      case "streak":
        if (maxStreak >= badge.requirement) earned = true;
        break;
      case "completion":
        if (totalCompletions >= badge.requirement) earned = true;
        break;
      case "milestone":
        if (completedGoals.length >= badge.requirement) earned = true;
        break;
    }

    if (earned) {
      await db.insert(userBadges).values({ badgeId: badge.id });
      newlyEarned.push(badge);
    }
  }

  return NextResponse.json({
    checked: allBadges.length,
    newlyEarned,
  });
}
