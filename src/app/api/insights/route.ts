import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUserInsights, getUserSpendingData, generateInsights } from "@/lib/ai";

export async function GET() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const insights = await getUserInsights(session.user.id);
  return NextResponse.json(insights);
}

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const spendingData = await getUserSpendingData(session.user.id);

    if (spendingData.length === 0 || spendingData.every((h) => h.entries.length === 0)) {
      return NextResponse.json(
        { error: "Not enough spending data to generate insights. Log some entries first." },
        { status: 400 }
      );
    }

    const insights = await generateInsights(session.user.id, spendingData);
    return NextResponse.json(insights, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes("limit reached")) {
      return NextResponse.json({ error: error.message }, { status: 403 });
    }
    console.error("Error generating insights:", error);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 }
    );
  }
}
