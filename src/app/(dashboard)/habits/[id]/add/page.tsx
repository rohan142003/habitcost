"use client";

import { useState, useEffect, use } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ArrowLeft, CalendarIcon } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Habit {
  id: string;
  name: string;
  category: string;
  defaultAmount: string | null;
}

export default function AddEntryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState("");

  useEffect(() => {
    fetch(`/api/habits/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setHabit(data);
        if (data.defaultAmount) {
          setAmount(data.defaultAmount);
        }
      })
      .catch((err) => {
        console.error("Failed to load habit:", err);
        toast.error("Failed to load habit");
      });
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          habitId: id,
          amount,
          date: date.toISOString(),
          notes: notes || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add entry");
      }

      toast.success("Entry added successfully!");
      router.push("/habits");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to add entry");
    } finally {
      setLoading(false);
    }
  };

  if (!habit) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/habits">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Add Entry</h1>
          <p className="text-muted-foreground">
            Log spending for {habit.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{habit.name}</CardTitle>
          <CardDescription>
            Add a new spending entry for this habit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="0.00"
                  className="pl-8 text-2xl h-14"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={(d) => d && setDate(d)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add any notes about this purchase..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !amount}>
                {loading ? "Adding..." : "Add Entry"}
              </Button>
              <Button type="button" variant="outline" asChild>
                <Link href="/habits">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
