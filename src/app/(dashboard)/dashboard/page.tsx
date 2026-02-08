"use client";

import { useEffect, useState } from "react";
import { StatCard } from "@/components/dashboard/stat-card";
import { TimeCostDisplay } from "@/components/dashboard/time-cost-display";
import { ProjectionCard } from "@/components/dashboard/projection-card";
import { SpendingChart } from "@/components/charts/spending-chart";
import { CategoryChart } from "@/components/charts/category-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency, calculateTrend } from "@/lib/calculations";
import { Coffee, Target, TrendingUp, Clock, Plus } from "lucide-react";
import Link from "next/link";

interface DashboardData {
  user: {
    name: string;
    hourlyWage: number;
    subscriptionTier: string;
  };
  totals: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  previousTotals: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
  chartData: { date: string; amount: number }[];
  categoryData: { name: string; value: number; color: string }[];
  habits: { id: string; name: string; category: string }[];
  goals: { id: string; name: string; targetAmount: string; currentAmount: string | null; status: string }[];
  recentEntries: {
    id: string;
    amount: string;
    date: Date;
    habitName: string;
    habitCategory: string;
  }[];
  habitCount: number;
  entryCount: number;
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load dashboard:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Loading your spending data...</p>
        </div>
        <DashboardSkeleton />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <p className="text-muted-foreground">Failed to load dashboard data.</p>
        <Button onClick={() => window.location.reload()}>Retry</Button>
      </div>
    );
  }

  const weeklyTrend = calculateTrend(data.totals.weekly, data.previousTotals.weekly);
  const monthlyTrend = calculateTrend(data.totals.monthly, data.previousTotals.monthly);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {data.user.name || "there"}!
          </p>
        </div>
        <Button asChild>
          <Link href="/habits/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Link>
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Today's Spending"
          value={formatCurrency(data.totals.daily)}
          icon={Coffee}
          description="spent today"
        />
        <StatCard
          title="This Week"
          value={formatCurrency(data.totals.weekly)}
          icon={TrendingUp}
          trend={weeklyTrend}
          description="vs last week"
        />
        <StatCard
          title="This Month"
          value={formatCurrency(data.totals.monthly)}
          icon={Target}
          trend={monthlyTrend}
          description="vs last month"
        />
        <StatCard
          title="This Year"
          value={formatCurrency(data.totals.yearly)}
          icon={Clock}
          description="total so far"
        />
      </div>

      {/* Time Cost & Projections */}
      <div className="grid gap-6 md:grid-cols-2">
        <TimeCostDisplay
          totalSpent={data.totals.monthly}
          hourlyWage={data.user.hourlyWage}
          period="this month"
        />
        <ProjectionCard monthlySpending={data.totals.monthly} />
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <SpendingChart data={data.chartData} title="Last 30 Days" />
        {data.categoryData.length > 0 ? (
          <CategoryChart data={data.categoryData} />
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Spending by Category</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                No spending data yet. Add some entries to see category breakdown.
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Activity & Goals */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Entries</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/habits">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.recentEntries.length > 0 ? (
              <div className="space-y-3">
                {data.recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between py-2 border-b last:border-0"
                  >
                    <div>
                      <p className="font-medium">{entry.habitName}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(entry.date).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(parseFloat(entry.amount))}
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {entry.habitCategory}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No entries yet.{" "}
                <Link href="/habits/new" className="text-primary hover:underline">
                  Add your first entry
                </Link>
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Active Goals</CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/goals">View all</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {data.goals.length > 0 ? (
              <div className="space-y-4">
                {data.goals.slice(0, 3).map((goal) => {
                  const target = parseFloat(goal.targetAmount);
                  const current = parseFloat(goal.currentAmount || "0");
                  const progress = Math.min((current / target) * 100, 100);

                  return (
                    <div key={goal.id}>
                      <div className="flex justify-between mb-1">
                        <span className="font-medium">{goal.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {Math.round(progress)}%
                        </span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatCurrency(current)} of {formatCurrency(target)}
                      </p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-muted-foreground text-center py-8">
                No active goals.{" "}
                <Link href="/goals/new" className="text-primary hover:underline">
                  Create a goal
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
