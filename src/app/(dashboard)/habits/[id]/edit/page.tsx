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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Coffee, Utensils, Car, CreditCard, Film, ShoppingBag, HelpCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const categories = [
  { value: "coffee", label: "Coffee & Drinks", icon: Coffee },
  { value: "food", label: "Food & Dining", icon: Utensils },
  { value: "transport", label: "Transportation", icon: Car },
  { value: "subscriptions", label: "Subscriptions", icon: CreditCard },
  { value: "entertainment", label: "Entertainment", icon: Film },
  { value: "shopping", label: "Shopping", icon: ShoppingBag },
  { value: "other", label: "Other", icon: HelpCircle },
];

interface Habit {
  id: string;
  name: string;
  category: string;
  defaultAmount: string | null;
}

export default function EditHabitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [habit, setHabit] = useState<Habit | null>(null);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [defaultAmount, setDefaultAmount] = useState("");

  useEffect(() => {
    fetch(`/api/habits/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setHabit(data);
        setName(data.name);
        setCategory(data.category);
        setDefaultAmount(data.defaultAmount || "");
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
      const res = await fetch(`/api/habits/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          category,
          defaultAmount: defaultAmount || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update habit");
      }

      toast.success("Habit updated successfully!");
      router.push("/habits");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update habit");
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
          <h1 className="text-3xl font-bold">Edit Habit</h1>
          <p className="text-muted-foreground">
            Update your habit details
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Habit Details</CardTitle>
          <CardDescription>
            Update the details of this habit
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Habit Name</Label>
              <Input
                id="name"
                placeholder="e.g., Morning Coffee, Uber Rides"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.value} value={cat.value}>
                      <div className="flex items-center gap-2">
                        <cat.icon className="h-4 w-4" />
                        {cat.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="defaultAmount">Default Amount (optional)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <Input
                  id="defaultAmount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-8"
                  value={defaultAmount}
                  onChange={(e) => setDefaultAmount(e.target.value)}
                />
              </div>
              <p className="text-sm text-muted-foreground">
                This will be pre-filled when adding entries
              </p>
            </div>

            <div className="flex gap-4">
              <Button type="submit" disabled={loading || !name || !category}>
                {loading ? "Saving..." : "Save Changes"}
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
