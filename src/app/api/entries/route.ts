import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { habitEntries, habits, users } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { z } from "zod";
import { tierLimits, type SubscriptionTier } from "@/lib/calculations";

const createEntrySchema = z.object({
  habitId: z.string().uuid(),
  amount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Amount must be a positive number",
  }),
  date: z.string().transform((val) => new Date(val)),
  notes: z.string().optional(),
});

export async function GET(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const habitId = searchParams.get("habitId");
  const days = parseInt(searchParams.get("days") || "30");

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  let query = db
    .select()
    .from(habitEntries)
    .where(
      and(
        eq(habitEntries.userId, session.user.id),
        gte(habitEntries.date, startDate)
      )
    )
    .orderBy(desc(habitEntries.date));

  if (habitId) {
    query = db
      .select()
      .from(habitEntries)
      .where(
        and(
          eq(habitEntries.userId, session.user.id),
          eq(habitEntries.habitId, habitId),
          gte(habitEntries.date, startDate)
        )
      )
      .orderBy(desc(habitEntries.date));
  }

  const entries = await query;
  return NextResponse.json(entries);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Verify habit belongs to user
  const habit = await db
    .select()
    .from(habits)
    .where(
      and(
        eq(habits.id, parsed.data.habitId),
        eq(habits.userId, session.user.id)
      )
    )
    .limit(1);

  if (!habit.length) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  // Check entry limit for free tier
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const tier = (user[0].subscriptionTier || "free") as SubscriptionTier;
  const limit = tierLimits[tier].maxEntriesPerMonth;

  if (limit !== Infinity) {
    const entriesThisMonth = user[0].entriesThisMonth || 0;
    const resetAt = user[0].entriesResetAt;
    const now = new Date();

    // Reset counter if it's a new month
    if (!resetAt || resetAt < new Date(now.getFullYear(), now.getMonth(), 1)) {
      await db
        .update(users)
        .set({
          entriesThisMonth: 1,
          entriesResetAt: new Date(now.getFullYear(), now.getMonth(), 1),
        })
        .where(eq(users.id, session.user.id));
    } else if (entriesThisMonth >= limit) {
      return NextResponse.json(
        {
          error: `Entry limit reached. Upgrade to Pro for unlimited entries.`,
        },
        { status: 403 }
      );
    } else {
      await db
        .update(users)
        .set({ entriesThisMonth: entriesThisMonth + 1 })
        .where(eq(users.id, session.user.id));
    }
  }

  const [newEntry] = await db
    .insert(habitEntries)
    .values({
      habitId: parsed.data.habitId,
      userId: session.user.id,
      amount: parsed.data.amount,
      date: parsed.data.date,
      notes: parsed.data.notes,
    })
    .returning();

  return NextResponse.json(newEntry, { status: 201 });
}
