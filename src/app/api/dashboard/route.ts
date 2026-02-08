import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, habits, habitEntries, goals } from "@/lib/db/schema";
import { eq, and, gte, lt, desc } from "drizzle-orm";
import { calculatePeriodTotals } from "@/lib/calculations";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user with hourly wage
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const hourlyWage = parseFloat(user[0].hourlyWage || "25");

  // Get all habits
  const userHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, session.user.id), eq(habits.isArchived, false)));

  // Get entries for the past 90 days
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const entries = await db
    .select({
      id: habitEntries.id,
      habitId: habitEntries.habitId,
      amount: habitEntries.amount,
      date: habitEntries.date,
      notes: habitEntries.notes,
    })
    .from(habitEntries)
    .where(
      and(
        eq(habitEntries.userId, session.user.id),
        gte(habitEntries.date, ninetyDaysAgo)
      )
    )
    .orderBy(desc(habitEntries.date));

  // Calculate period totals
  const totals = calculatePeriodTotals(entries);

  // Calculate spending by category
  const categoryTotals: Record<string, number> = {};
  for (const entry of entries) {
    const habit = userHabits.find((h) => h.id === entry.habitId);
    if (habit) {
      const category = habit.category;
      categoryTotals[category] = (categoryTotals[category] || 0) + parseFloat(entry.amount);
    }
  }

  // Calculate daily spending for chart (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailySpending: Record<string, number> = {};
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];
    dailySpending[dateStr] = 0;
  }

  for (const entry of entries) {
    const dateStr = new Date(entry.date).toISOString().split("T")[0];
    if (dailySpending[dateStr] !== undefined) {
      dailySpending[dateStr] += parseFloat(entry.amount);
    }
  }

  const chartData = Object.entries(dailySpending)
    .map(([date, amount]) => ({
      date: new Date(date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      amount,
    }))
    .reverse();

  // Get active goals
  const activeGoals = await db
    .select()
    .from(goals)
    .where(and(eq(goals.userId, session.user.id), eq(goals.status, "active")));

  // Calculate previous period totals for trends
  const sixtyDaysAgo = new Date();
  sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

  const previousEntries = await db
    .select({
      amount: habitEntries.amount,
      date: habitEntries.date,
    })
    .from(habitEntries)
    .where(
      and(
        eq(habitEntries.userId, session.user.id),
        gte(habitEntries.date, sixtyDaysAgo),
        lt(habitEntries.date, thirtyDaysAgo)
      )
    );

  const previousTotals = calculatePeriodTotals(previousEntries);

  // Category colors
  const categoryColors: Record<string, string> = {
    coffee: "#8B4513",
    food: "#FF6B6B",
    transport: "#4ECDC4",
    subscriptions: "#9B59B6",
    entertainment: "#F39C12",
    shopping: "#E74C3C",
    other: "#95A5A6",
  };

  const categoryData = Object.entries(categoryTotals).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
    color: categoryColors[name] || "#95A5A6",
  }));

  // Recent entries
  const recentEntries = entries.slice(0, 5).map((entry) => {
    const habit = userHabits.find((h) => h.id === entry.habitId);
    return {
      ...entry,
      habitName: habit?.name || "Unknown",
      habitCategory: habit?.category || "other",
    };
  });

  return NextResponse.json({
    user: {
      name: user[0].name,
      hourlyWage,
      subscriptionTier: user[0].subscriptionTier,
    },
    totals,
    previousTotals,
    chartData,
    categoryData,
    habits: userHabits,
    goals: activeGoals,
    recentEntries,
    habitCount: userHabits.length,
    entryCount: entries.length,
  });
}
