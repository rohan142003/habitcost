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
  Coffee,
  Utensils,
  Car,
  CreditCard,
  Film,
  ShoppingBag,
  HelpCircle,
  Edit,
  Trash2,
  Archive,
} from "lucide-react";
import { toast } from "sonner";

interface Habit {
  id: string;
  name: string;
  category: string;
  defaultAmount: string | null;
  isArchived: boolean;
  createdAt: Date;
}

interface Entry {
  id: string;
  habitId: string;
  amount: string;
  date: Date;
}

const categoryIcons: Record<string, React.ElementType> = {
  coffee: Coffee,
  food: Utensils,
  transport: Car,
  subscriptions: CreditCard,
  entertainment: Film,
  shopping: ShoppingBag,
  other: HelpCircle,
};

const categoryColors: Record<string, string> = {
  coffee: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100",
  food: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
  transport: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100",
  subscriptions: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100",
  entertainment: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100",
  shopping: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-100",
  other: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-100",
};

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/habits").then((res) => res.json()),
      fetch("/api/entries?days=30").then((res) => res.json()),
    ])
      .then(([habitsData, entriesData]) => {
        setHabits(habitsData);
        setEntries(entriesData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load habits:", err);
        setLoading(false);
      });
  }, []);

  const handleArchive = async (habitId: string) => {
    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isArchived: true }),
      });

      if (!res.ok) throw new Error("Failed to archive habit");

      setHabits(habits.filter((h) => h.id !== habitId));
      toast.success("Habit archived");
    } catch (error) {
      toast.error("Failed to archive habit");
    }
  };

  const handleDelete = async (habitId: string) => {
    if (!confirm("Are you sure? This will also delete all entries for this habit.")) {
      return;
    }

    try {
      const res = await fetch(`/api/habits/${habitId}`, {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("Failed to delete habit");

      setHabits(habits.filter((h) => h.id !== habitId));
      toast.success("Habit deleted");
    } catch (error) {
      toast.error("Failed to delete habit");
    }
  };

  const getHabitStats = (habitId: string) => {
    const habitEntries = entries.filter((e) => e.habitId === habitId);
    const total = habitEntries.reduce((sum, e) => sum + parseFloat(e.amount), 0);
    return { total, count: habitEntries.length };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Habits</h1>
          <p className="text-muted-foreground">
            Manage your tracked spending habits
          </p>
        </div>
        <Button asChild>
          <Link href="/habits/new">
            <Plus className="h-4 w-4 mr-2" />
            Add Habit
          </Link>
        </Button>
      </div>

      {habits.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Coffee className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No habits yet</h3>
            <p className="text-muted-foreground mb-4">
              Start tracking your spending habits to see where your money goes.
            </p>
            <Button asChild>
              <Link href="/habits/new">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Habit
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {habits.map((habit) => {
            const Icon = categoryIcons[habit.category] || HelpCircle;
            const stats = getHabitStats(habit.id);

            return (
              <Card key={habit.id} className="relative group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-lg ${categoryColors[habit.category]}`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{habit.name}</CardTitle>
                        <Badge variant="secondary" className="mt-1">
                          {habit.category}
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
                          <Link href={`/habits/${habit.id}/edit`}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleArchive(habit.id)}>
                          <Archive className="h-4 w-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(habit.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <p className="text-sm text-muted-foreground">Last 30 days</p>
                      <p className="text-xl font-bold">
                        {formatCurrency(stats.total)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Entries</p>
                      <p className="text-xl font-bold">{stats.count}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button variant="outline" size="sm" className="w-full" asChild>
                      <Link href={`/habits/${habit.id}/add`}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add Entry
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
