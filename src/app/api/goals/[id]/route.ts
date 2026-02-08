import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateGoalSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  targetAmount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Target amount must be a positive number",
    })
    .optional(),
  currentAmount: z.string().optional(),
  status: z.enum(["active", "completed", "cancelled"]).optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
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

  const goal = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
    .limit(1);

  if (!goal.length) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  return NextResponse.json(goal[0]);
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
  const parsed = updateGoalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const goal = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
    .limit(1);

  if (!goal.length) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(goals)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(goals.id, id))
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

  const goal = await db
    .select()
    .from(goals)
    .where(and(eq(goals.id, id), eq(goals.userId, session.user.id)))
    .limit(1);

  if (!goal.length) {
    return NextResponse.json({ error: "Goal not found" }, { status: 404 });
  }

  await db.delete(goals).where(eq(goals.id, id));

  return NextResponse.json({ success: true });
}
