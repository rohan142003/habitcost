import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCheckoutSession } from "@/lib/stripe";
import { z } from "zod";

const checkoutSchema = z.object({
  plan: z.enum(["pro", "premium"]),
});

export async function POST(request: NextRequest) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = checkoutSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  try {
    const checkoutSession = await createCheckoutSession(
      session.user.id,
      parsed.data.plan
    );

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
