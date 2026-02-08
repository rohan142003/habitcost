import Anthropic from "@anthropic-ai/sdk";
import { db } from "@/lib/db";
import { aiInsights, users, habits, habitEntries } from "@/lib/db/schema";
import { eq, and, gte, desc } from "drizzle-orm";
import { tierLimits, type SubscriptionTier } from "@/lib/calculations";

// Lazy initialization to avoid errors during build
let anthropicInstance: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!anthropicInstance) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error("ANTHROPIC_API_KEY is not configured");
    }
    anthropicInstance = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  return anthropicInstance;
}

type InsightType = "pattern" | "suggestion" | "prediction" | "celebration";

interface SpendingData {
  habitName: string;
  category: string;
  entries: { amount: string; date: Date; notes: string | null }[];
}

export async function generateInsights(
  userId: string,
  spendingData: SpendingData[]
): Promise<{ type: InsightType; title: string; content: string }[]> {
  // Check user's insight limit
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length) {
    throw new Error("User not found");
  }

  const tier = (user[0].subscriptionTier || "free") as SubscriptionTier;
  const limit = tierLimits[tier].maxAiInsightsPerMonth;
  const used = user[0].aiInsightsUsed || 0;

  if (used >= limit) {
    throw new Error("AI insights limit reached for this month");
  }

  // Prepare data summary for Claude
  const dataSummary = spendingData.map((habit) => ({
    habit: habit.habitName,
    category: habit.category,
    totalSpent: habit.entries.reduce(
      (sum, e) => sum + parseFloat(e.amount),
      0
    ),
    entryCount: habit.entries.length,
    averageAmount:
      habit.entries.length > 0
        ? habit.entries.reduce((sum, e) => sum + parseFloat(e.amount), 0) /
          habit.entries.length
        : 0,
    recentEntries: habit.entries.slice(0, 10).map((e) => ({
      amount: e.amount,
      date: e.date.toISOString().split("T")[0],
      dayOfWeek: e.date.toLocaleDateString("en-US", { weekday: "long" }),
    })),
  }));

  const prompt = `You are a financial wellness assistant helping users understand their spending habits. Analyze the following spending data and provide actionable insights.

User's spending data:
${JSON.stringify(dataSummary, null, 2)}

Generate 3-5 insights in the following categories:
1. PATTERN: Identify spending patterns (e.g., "You spend 40% more on Mondays")
2. SUGGESTION: Actionable money-saving tips (e.g., "Making coffee at home could save $50/month")
3. PREDICTION: Forecast based on current habits (e.g., "At this rate, you'll spend $X this year on coffee")
4. CELEBRATION: Positive reinforcement for any improvements or good habits

Format your response as a JSON array with objects containing:
- type: "pattern" | "suggestion" | "prediction" | "celebration"
- title: A short, engaging title (max 50 chars)
- content: The insight details (2-3 sentences)

Respond ONLY with the JSON array, no other text.`;

  try {
    const message = await getAnthropic().messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const responseText =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    const insights = JSON.parse(responseText) as {
      type: InsightType;
      title: string;
      content: string;
    }[];

    // Update usage count
    await db
      .update(users)
      .set({ aiInsightsUsed: used + 1 })
      .where(eq(users.id, userId));

    // Store insights in database
    for (const insight of insights) {
      await db.insert(aiInsights).values({
        userId,
        type: insight.type,
        title: insight.title,
        content: insight.content,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      });
    }

    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    throw error;
  }
}

export async function getUserInsights(userId: string) {
  return db
    .select()
    .from(aiInsights)
    .where(
      and(
        eq(aiInsights.userId, userId),
        gte(aiInsights.expiresAt, new Date())
      )
    )
    .orderBy(desc(aiInsights.createdAt))
    .limit(20);
}

export async function markInsightHelpful(
  insightId: string,
  isHelpful: boolean
) {
  return db
    .update(aiInsights)
    .set({ isHelpful })
    .where(eq(aiInsights.id, insightId));
}

export async function getUserSpendingData(userId: string): Promise<SpendingData[]> {
  const userHabits = await db
    .select()
    .from(habits)
    .where(and(eq(habits.userId, userId), eq(habits.isArchived, false)));

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const spendingData: SpendingData[] = [];

  for (const habit of userHabits) {
    const entries = await db
      .select()
      .from(habitEntries)
      .where(
        and(
          eq(habitEntries.habitId, habit.id),
          gte(habitEntries.date, thirtyDaysAgo)
        )
      )
      .orderBy(desc(habitEntries.date));

    spendingData.push({
      habitName: habit.name,
      category: habit.category,
      entries: entries.map((e) => ({
        amount: e.amount,
        date: e.date,
        notes: e.notes,
      })),
    });
  }

  return spendingData;
}
