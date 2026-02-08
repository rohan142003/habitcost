"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCurrency } from "@/lib/calculations";
import {
  Plus,
  MoreVertical,
  Target,
  TrendingDown,
  Trophy,
  Edit,
  Trash2,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";

interface Goal {
  id: string;
  name: string;
  type: string;
  targetAmount: string;
  currentAmount: string | null;
  startDate: Date;
  endDate: Date | null;
  status: string;
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/goals")
      .then((res) => res.json())
      .then((data) => {
        setGoals(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load goals:", err);
        setLoading(false);
      });
  }, []);

  const handleComplete = async (goalId: string) => {
    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "completed" }),
      });

      if (!res.ok) throw new Error("Failed to complete goal");

      setGoals(
        goals.map((g) => (g.id === goalId ? { ...g, status: "completed" } : g))
      );
      toast.success("Goal completed! Congratulations!");
    } catch (error) {
      toast.error("Failed to complete goal");
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm("Are you sure you want to delete this goal?")) {
      return;
    }

    try {
      const res = await fetch(`/api/goals/${goalId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete goal");

      setGoals(goals.filter((g) => g.id !== goalId));
      toast.success("Goal deleted");
    } catch (error) {
      toast.error("Failed to delete goal");
    }
  };

  const activeGoals = goals.filter((g) => g.status === "active");
  const completedGoals = goals.filter((g) => g.status === "completed");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Goals</h1>
          <p className="text-muted-foreground">
            Track your savings and reduction goals
          </p>
        </div>
        <Button asChild>
          <Link href="/goals/new">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Link>
        </Button>
      </div>

      {goals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Target className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No goals yet</h3>
            <p className="text-muted-foreground mb-4 text-center">
              Set savings or spending reduction goals to help you achieve your
              financial dreams.
            </p>
            <Button asChild>
              <Link href="/goals/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Active Goals */}
          {activeGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Active Goals</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeGoals.map((goal) => {
                  const target = parseFloat(goal.targetAmount);
                  const current = parseFloat(goal.currentAmount || "0");
                  const progress = Math.min((current / target) * 100, 100);

                  return (
                    <Card key={goal.id} className="relative group">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded-lg ${
                                goal.type === "savings"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100"
                              }`}
                            >
                              {goal.type === "savings" ? (
                                <Target className="h-5 w-5" />
                              ) : (
                                <TrendingDown className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <CardTitle className="text-lg">{goal.name}</CardTitle>
                              <Badge variant="secondary" className="mt-1">
                                {goal.type === "savings" ? "Savings" : "Reduction"}
                              </Badge>
                            </div>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/goals/${goal.id}/edit`}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleComplete(goal.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Mark Complete
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => handleDelete(goal.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-sm text-muted-foreground">
                                Progress
                              </span>
                              <span className="text-sm font-medium">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <Progress value={progress} />
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              Current: {formatCurrency(current)}
                            </span>
                            <span className="font-medium">
                              Target: {formatCurrency(target)}
                            </span>
                          </div>
                          {goal.endDate && (
                            <p className="text-xs text-muted-foreground">
                              Due:{" "}
                              {new Date(goal.endDate).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed Goals */}
          {completedGoals.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Completed Goals</h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedGoals.map((goal) => (
                  <Card key={goal.id} className="opacity-75">
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
                          <Trophy className="h-5 w-5" />
                        </div>
                        <div>
                          <CardTitle className="text-lg">{goal.name}</CardTitle>
                          <Badge variant="secondary" className="mt-1">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        Achieved: {formatCurrency(parseFloat(goal.targetAmount))}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
