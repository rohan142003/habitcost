import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { markInsightHelpful } from "@/lib/ai";
import { z } from "zod";

const feedbackSchema = z.object({
  isHelpful: z.boolean(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  const { id } = await params;

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = feedbackSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", details: parsed.error.issues },
      { status: 400 }
    );
  }

  await markInsightHelpful(id, parsed.data.isHelpful);

  return NextResponse.json({ success: true });
}
