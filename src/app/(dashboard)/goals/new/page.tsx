"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon, Target, TrendingDown } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
}

export default function NewGoalPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"savings" | "reduction">("savings");
  const [targetAmount, setTargetAmount] = useState("");
  const [habitId, setHabitId] = useState("");
  const [endDate, setEndDate] = useState<Date | undefined>();

  useEffect(() => {
    fetch("/api/habits")
      .then((res) => res.json())
      .then((data) => setHabits(data))
      .catch((err) => console.error("Failed to load habits:", err));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/goals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          type,
          targetAmount,
          habitId: habitId || undefined,
          endDate: endDate?.toISOString(),
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create goal");
      }

      toast.success("Goal created successfully!");
      router.push("/goals");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to create goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/goals">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Goal</h1>
          <p className="text-muted-foreground">
            Set a savings or spending reduction goal
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Goal Details</CardTitle>
          <CardDescription>
            Define your financial goal and track your progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Goal Name</Label>
              <Input
                id="name"
                placeholder="e.g., Vacation Fund, Reduce Coffee Spending"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Goal Type</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  className={cn(
                    "p-4 border rounded-lg text-left transition-colors",
                    type === "savings"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => setType("savings")}
                >
                  <Target className="h-6 w-6 mb-2 text-green-600" />
                  <p className="font-medium">Savings Goal</p>
                  <p className="text-sm text-muted-foreground">
                    Save money for something specific
                  </p>
                </button>
                <button
                  type="button"
                  className={cn(
                    "p-4 border rounded-lg text-left transition-colors",
                    type === "reduction"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-muted-foreground"
                  )}
                  onClick={() => setType("reduction")}
                >
                  <TrendingDown className="h-6 w-6 mb-2 text-blue-600" />
                  <p className="font-medium">Reduction Goal</p>
                  <p className="text-sm text-muted-foreground">
                    Reduce spending on a habit
                  </p>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetAmount">Target Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  min="1"
                  placeholder="0.00"
                  className="pl-8"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  required
                />
              </div>
              <p className="text-sm text-muted-foreground">
                {type === "savings"
                  ? "The total amount you want to save"
                  : "The target spending limit"}
              </p>
            </div>

            {type === "reduction" && habits.length > 0 && (
              <div className="space-y-2">
                <Label htmlFor="habit">Related Habit (optional)</Label>
                <Select value={habitId} onValueChange={setHabitId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a habit" />
                  </SelectTrigger>
                  <SelectContent>
                    {habits.map((habit) => (
                      <SelectItem key={habit.id} value={habit.id}>
                        {habit.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Target Date (optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !endDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !name || !targetAmount}>
                {loading ? "Creating..." : "Create Goal"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/goals">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
