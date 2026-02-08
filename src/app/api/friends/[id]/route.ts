import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { friendships } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";

const updateFriendshipSchema = z.object({
  status: z.enum(["accepted", "blocked"]),
});

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
  const parsed = updateFriendshipSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Find friendship where user is addressee (only addressee can accept)
  const friendship = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.id, id),
        or(
          eq(friendships.addresseeId, session.user.id),
          eq(friendships.requesterId, session.user.id)
        )
      )
    )
    .limit(1);

  if (!friendship.length) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  // Only addressee can accept
  if (
    parsed.data.status === "accepted" &&
    friendship[0].addresseeId !== session.user.id
  ) {
    return NextResponse.json(
      { error: "Only the addressee can accept friend requests" },
      { status: 403 }
    );
  }

  const [updated] = await db
    .update(friendships)
    .set({ status: parsed.data.status, updatedAt: new Date() })
    .where(eq(friendships.id, id))
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

  const friendship = await db
    .select()
    .from(friendships)
    .where(
      and(
        eq(friendships.id, id),
        or(
          eq(friendships.requesterId, session.user.id),
          eq(friendships.addresseeId, session.user.id)
        )
      )
    )
    .limit(1);

  if (!friendship.length) {
    return NextResponse.json({ error: "Friendship not found" }, { status: 404 });
  }

  await db.delete(friendships).where(eq(friendships.id, id));

  return NextResponse.json({ success: true });
}
