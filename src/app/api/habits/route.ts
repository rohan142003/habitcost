import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { habits } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { tierLimits, type SubscriptionTier } from "@/lib/calculations";
import { users } from "@/lib/db/schema";

const createHabitSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.enum([
    "coffee",
    "food",
    "transport",
    "subscriptions",
    "entertainment",
    "shopping",
    "other",
  ]),
  defaultAmount: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, session.user.id), eq(habits.isArchived, false)));

  return NextResponse.json(userHabits);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createHabitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Check habit limit
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tier = (user[0].subscriptionTier || "free") as SubscriptionTier;
  const limit = tierLimits[tier].maxHabits;

  const existingHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, session.user.id), eq(habits.isArchived, false)));

  if (existingHabits.length >= limit) {
    return NextResponse.json(
      {
        error: `Habit limit reached. Upgrade to ${tier === "free" ? "Pro" : "Premium"} for more habits.`,
      },
      { status: 403 }
    );
  }

  const [newHabit] = await db
    .insert(habits)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      category: parsed.data.category,
      defaultAmount: parsed.data.defaultAmount,
      icon: parsed.data.icon,
      color: parsed.data.color,
    })
    .returning();

  return NextResponse.json(newHabit, { status: 201 });
}
