"use client";

import { useState, useEffect, useCallback } from "react";

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
  notes: string | null;
}

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      if (!res.ok) throw new Error("Failed to fetch habits");
      const data = await res.json();
      setHabits(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const createHabit = async (habit: {
    name: string;
    category: string;
    defaultAmount?: string;
  }) => {
    const res = await fetch("/api/habits", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(habit),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create habit");
    }

    const newHabit = await res.json();
    setHabits([...habits, newHabit]);
    return newHabit;
  };

  const updateHabit = async (id: string, updates: Partial<Habit>) => {
    const res = await fetch(`/api/habits/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Failed to update habit");

    const updated = await res.json();
    setHabits(habits.map((h) => (h.id === id ? updated : h)));
    return updated;
  };

  const deleteHabit = async (id: string) => {
    const res = await fetch(`/api/habits/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete habit");
    setHabits(habits.filter((h) => h.id !== id));
  };

  return {
    habits,
    loading,
    error,
    createHabit,
    updateHabit,
    deleteHabit,
    refresh: fetchHabits,
  };
}

export function useEntries(habitId?: string, days: number = 30) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchEntries = useCallback(async () => {
    try {
      const url = habitId
        ? `/api/entries?habitId=${habitId}&days=${days}`
        : `/api/entries?days=${days}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch entries");
      const data = await res.json();
      setEntries(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      setLoading(false);
    }
  }, [habitId, days]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const createEntry = async (entry: {
    habitId: string;
    amount: string;
    date: string;
    notes?: string;
  }) => {
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(entry),
    });

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || "Failed to create entry");
    }

    const newEntry = await res.json();
    setEntries([newEntry, ...entries]);
    return newEntry;
  };

  const deleteEntry = async (id: string) => {
    const res = await fetch(`/api/entries/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete entry");
    setEntries(entries.filter((e) => e.id !== id));
  };

  return {
    entries,
    loading,
    error,
    createEntry,
    deleteEntry,
    refresh: fetchEntries,
  };
}
