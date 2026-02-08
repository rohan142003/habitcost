import Stripe from "stripe";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// Lazy initialization to avoid errors during build
let stripeInstance: Stripe | null = null;

export function getStripe(): Stripe {
  if (!stripeInstance) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not configured");
    }
    stripeInstance = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-01-28.clover",
    });
  }
  return stripeInstance;
}

// For backward compatibility
export const stripe = {
  get customers() { return getStripe().customers; },
  get checkout() { return getStripe().checkout; },
  get billingPortal() { return getStripe().billingPortal; },
  get webhooks() { return getStripe().webhooks; },
};

export const PLANS = {
  pro: {
    name: "Pro",
    price: 5.99,
    priceId: process.env.STRIPE_PRO_PRICE_ID!,
    features: [
      "25 habits",
      "Unlimited entries",
      "100 AI insights/month",
      "Advanced charts",
      "Goal tracking",
    ],
  },
  premium: {
    name: "Premium",
    price: 12.99,
    priceId: process.env.STRIPE_PREMIUM_PRICE_ID!,
    features: [
      "Unlimited habits",
      "Unlimited entries",
      "Unlimited AI insights",
      "API access",
      "Family sharing (up to 5)",
      "Priority support",
    ],
  },
} as const;

export async function createCheckoutSession(
  userId: string,
  plan: "pro" | "premium"
) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length) {
    throw new Error("User not found");
  }

  let customerId = user[0].stripeCustomerId;

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: user[0].email,
      name: user[0].name || undefined,
      metadata: { userId },
    });
    customerId = customer.id;

    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, userId));
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [
      {
        price: PLANS[plan].priceId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing?canceled=true`,
    metadata: { userId, plan },
  });

  return session;
}

export async function createCustomerPortalSession(userId: string) {
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user.length || !user[0].stripeCustomerId) {
    throw new Error("No subscription found");
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: user[0].stripeCustomerId,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings/billing`,
  });

  return session;
}

export async function handleSubscriptionChange(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  const user = await db
    .select()
    .from(users)
    .where(eq(users.stripeCustomerId, customerId))
    .limit(1);

  if (!user.length) {
    console.error("User not found for customer:", customerId);
    return;
  }

  const priceId = subscription.items.data[0]?.price.id;
  let tier: "free" | "pro" | "premium" = "free";

  if (priceId === PLANS.pro.priceId) {
    tier = "pro";
  } else if (priceId === PLANS.premium.priceId) {
    tier = "premium";
  }

  const isActive =
    subscription.status === "active" || subscription.status === "trialing";

  // Get the current period end from the subscription
  const periodEnd = (subscription as unknown as { current_period_end?: number }).current_period_end;

  await db
    .update(users)
    .set({
      subscriptionTier: isActive ? tier : "free",
      stripeSubscriptionId: subscription.id,
      subscriptionEndsAt: periodEnd ? new Date(periodEnd * 1000) : null,
    })
    .where(eq(users.id, user[0].id));
}

export async function handleSubscriptionDeleted(
  subscription: Stripe.Subscription
) {
  const customerId = subscription.customer as string;

  await db
    .update(users)
    .set({
      subscriptionTier: "free",
      stripeSubscriptionId: null,
      subscriptionEndsAt: null,
    })
    .where(eq(users.stripeCustomerId, customerId));
}
