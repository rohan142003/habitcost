import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { createCustomerPortalSession } from "@/lib/stripe";

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const portalSession = await createCustomerPortalSession(session.user.id);
    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Error creating portal session:", error);
    return NextResponse.json(
      { error: "Failed to create portal session. You may not have an active subscription." },
      { status: 500 }
    );
  }
}
