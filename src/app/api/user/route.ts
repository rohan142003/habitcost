import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";

const updateUserSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  hourlyWage: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Hourly wage must be a positive number",
    })
    .optional(),
  currency: z.string().length(3).optional(),
  privacyShareProgress: z.boolean().optional(),
  privacyShareAmounts: z.boolean().optional(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Don't send sensitive fields
  const { stripeCustomerId, stripeSubscriptionId, ...safeUser } = user[0];
  return NextResponse.json(safeUser);
}

export async function PATCH(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, session.user.id))
    .returning();

  const { stripeCustomerId, stripeSubscriptionId, ...safeUser } = updated;
  return NextResponse.json(safeUser);
}
