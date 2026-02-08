import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { friendships, users } from "@/lib/db/schema";
import { eq, and, or } from "drizzle-orm";
import { z } from "zod";

const sendRequestSchema = z.object({
  email: z.string().email(),
});

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get all friendships (both directions)
  const userFriendships = await db
    .select({
      friendship: friendships,
      requester: users,
    })
    .from(friendships)
    .innerJoin(users, eq(users.id, friendships.requesterId))
    .where(
      or(
        eq(friendships.requesterId, session.user.id),
        eq(friendships.addresseeId, session.user.id)
      )
    );

  // Get addressee info for friendships where user is requester
  const enrichedFriendships = await Promise.all(
    userFriendships.map(async (f) => {
      const isRequester = f.friendship.requesterId === session.user.id;
      const otherUserId = isRequester
        ? f.friendship.addresseeId
        : f.friendship.requesterId;

      const otherUser = await db
        .select({ id: users.id, name: users.name, email: users.email, image: users.image })
        .from(users)
        .where(eq(users.id, otherUserId))
        .limit(1);

      return {
        ...f.friendship,
        isRequester,
        friend: otherUser[0],
      };
    })
  );

  return NextResponse.json(enrichedFriendships);
}

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = sendRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  // Find user by email
  const targetUser = await db
    .select()
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);

  if (!targetUser.length) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  if (targetUser[0].id === session.user.id) {
    return NextResponse.json(
      { error: "Cannot send friend request to yourself" },
      { status: 400 }
    );
  }

  // Check if friendship already exists
  const existing = await db
    .select()
    .from(friendships)
    .where(
      or(
        and(
          eq(friendships.requesterId, session.user.id),
          eq(friendships.addresseeId, targetUser[0].id)
        ),
        and(
          eq(friendships.requesterId, targetUser[0].id),
          eq(friendships.addresseeId, session.user.id)
        )
      )
    )
    .limit(1);

  if (existing.length) {
    return NextResponse.json(
      { error: "Friendship already exists" },
      { status: 400 }
    );
  }

  const [newFriendship] = await db
    .insert(friendships)
    .values({
      requesterId: session.user.id,
      addresseeId: targetUser[0].id,
    })
    .returning();

  return NextResponse.json(newFriendship, { status: 201 });
}
