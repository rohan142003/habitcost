import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { habitEntries } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { z } from "zod";

const updateEntrySchema = z.object({
  amount: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: "Amount must be a positive number",
    })
    .optional(),
  date: z.string().transform((val) => new Date(val)).optional(),
  notes: z.string().optional(),
});

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const entry = await db
    .select()
    .from(habitEntries)
    .where(and(eq(habitEntries.id, id), eq(habitEntries.userId, session.user.id)))
    .limit(1);

  if (!entry.length) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  await db.delete(habitEntries).where(eq(habitEntries.id, id));

  return NextResponse.json({ success: true });
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
  const parsed = updateEntrySchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  const entry = await db
    .select()
    .from(habitEntries)
    .where(and(eq(habitEntries.id, id), eq(habitEntries.userId, session.user.id)))
    .limit(1);

  if (!entry.length) {
    return NextResponse.json({ error: "Entry not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(habitEntries)
    .set(parsed.data)
    .where(eq(habitEntries.id, id))
    .returning();

  return NextResponse.json(updated);
}
