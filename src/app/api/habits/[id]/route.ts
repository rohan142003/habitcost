import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { habits } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateHabitSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  category: z
    .enum([
      "coffee",
      "food",
      "transport",
      "subscriptions",
      "entertainment",
      "shopping",
      "other",
    ])
    .optional(),
  defaultAmount: z.string().optional(),
  icon: z.string().optional(),
  color: z.string().optional(),
  isArchived: z.boolean().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habit = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, session.user.id)))
    .limit(1);

  if (!habit.length) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  return NextResponse.json(habit[0]);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateHabitSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const habit = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, session.user.id)))
    .limit(1);

  if (!habit.length) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(habits)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(habits.id, id))
    .returning();

  return NextResponse.json(updated);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const habit = await db
    .select()
    .from(habits)
    .where(and(eq(habits.id, id), eq(habits.userId, session.user.id)))
    .limit(1);

  if (!habit.length) {
    return NextResponse.json({ error: "Habit not found" }, { status: 404 });
  }

  await db.delete(habits).where(eq(habits.id, id));

  return NextResponse.json({ success: true });
}
