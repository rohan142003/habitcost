"use client";

import { useState, useEffect } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  hourlyWage: string | null;
  currency: string | null;
  subscriptionTier: string;
  aiInsightsUsed: number;
  entriesThisMonth: number;
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch user");
        return res.json();
      })
      .then((data) => {
        setUser(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  const updateUser = async (updates: Partial<User>) => {
    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });

    if (!res.ok) throw new Error("Failed to update user");

    const updated = await res.json();
    setUser(updated);
    return updated;
  };

  return { user, loading, error, updateUser };
}
