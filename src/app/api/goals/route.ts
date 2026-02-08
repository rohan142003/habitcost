import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { goals } from "@/lib/db/schema";
import { eq, and, not } from "drizzle-orm";
import { z } from "zod";

const createGoalSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(["savings", "reduction"]),
  targetAmount: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: "Target amount must be a positive number",
  }),
  habitId: z.string().uuid().optional(),
  endDate: z.string().transform((val) => new Date(val)).optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userGoals = await db
    .select()
    .from(goals)
    .where(
      and(
        eq(goals.userId, session.user.id),
        not(eq(goals.status, "cancelled"))
      )
    );

  return NextResponse.json(userGoals);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = createGoalSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const [newGoal] = await db
    .insert(goals)
    .values({
      userId: session.user.id,
      name: parsed.data.name,
      type: parsed.data.type,
      targetAmount: parsed.data.targetAmount,
      habitId: parsed.data.habitId,
      startDate: new Date(),
      endDate: parsed.data.endDate,
    })
    .returning();

  return NextResponse.json(newGoal, { status: 201 });
}
