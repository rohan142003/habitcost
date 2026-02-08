import {
  pgTable,
  text,
  timestamp,
  integer,
  decimal,
  boolean,
  pgEnum,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import type { AdapterAccount } from "next-auth/adapters";

// Enums
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "pro",
  "premium",
]);

export const habitCategoryEnum = pgEnum("habit_category", [
  "coffee",
  "food",
  "transport",
  "subscriptions",
  "entertainment",
  "shopping",
  "other",
]);

export const goalTypeEnum = pgEnum("goal_type", ["savings", "reduction"]);

export const goalStatusEnum = pgEnum("goal_status", [
  "active",
  "completed",
  "cancelled",
]);

export const friendshipStatusEnum = pgEnum("friendship_status", [
  "pending",
  "accepted",
  "blocked",
]);

export const insightTypeEnum = pgEnum("insight_type", [
  "pattern",
  "suggestion",
  "prediction",
  "celebration",
]);

// Users table (NextAuth compatible)
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text("name"),
  email: text("email").unique().notNull(),
  emailVerified: timestamp("emailVerified", { mode: "date" }),
  image: text("image"),
  // Custom fields
  hourlyWage: decimal("hourly_wage", { precision: 10, scale: 2 }),
  currency: text("currency").default("USD"),
  subscriptionTier: subscriptionTierEnum("subscription_tier").default("free"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionEndsAt: timestamp("subscription_ends_at", { mode: "date" }),
  aiInsightsUsed: integer("ai_insights_used").default(0),
  aiInsightsResetAt: timestamp("ai_insights_reset_at", { mode: "date" }),
  entriesThisMonth: integer("entries_this_month").default(0),
  entriesResetAt: timestamp("entries_reset_at", { mode: "date" }),
  privacyShareProgress: boolean("privacy_share_progress").default(false),
  privacyShareAmounts: boolean("privacy_share_amounts").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// NextAuth tables
export const accounts = pgTable(
  "accounts",
  {
    userId: text("userId")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount["type"]>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("providerAccountId").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
  },
  (account) => [
    primaryKey({ columns: [account.provider, account.providerAccountId] }),
  ]
);

export const sessions = pgTable("sessions", {
  sessionToken: text("sessionToken").primaryKey(),
  userId: text("userId")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { mode: "date" }).notNull(),
});

export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { mode: "date" }).notNull(),
  },
  (token) => [primaryKey({ columns: [token.identifier, token.token] })]
);

// Habits table
export const habits = pgTable("habits", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: habitCategoryEnum("category").notNull(),
  defaultAmount: decimal("default_amount", { precision: 10, scale: 2 }),
  icon: text("icon"),
  color: text("color"),
  isArchived: boolean("is_archived").default(false),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Habit entries table
export const habitEntries = pgTable("habit_entries", {
  id: uuid("id").primaryKey().defaultRandom(),
  habitId: uuid("habit_id")
    .notNull()
    .references(() => habits.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  date: timestamp("date", { mode: "date" }).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Goals table
export const goals = pgTable("goals", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  habitId: uuid("habit_id").references(() => habits.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  type: goalTypeEnum("type").notNull(),
  targetAmount: decimal("target_amount", { precision: 10, scale: 2 }).notNull(),
  currentAmount: decimal("current_amount", { precision: 10, scale: 2 }).default("0"),
  startDate: timestamp("start_date", { mode: "date" }).notNull(),
  endDate: timestamp("end_date", { mode: "date" }),
  status: goalStatusEnum("status").default("active"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// Friendships table
export const friendships = pgTable("friendships", {
  id: uuid("id").primaryKey().defaultRandom(),
  requesterId: text("requester_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  addresseeId: text("addressee_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  status: friendshipStatusEnum("status").default("pending"),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow(),
});

// AI Insights table
export const aiInsights = pgTable("ai_insights", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: insightTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  habitId: uuid("habit_id").references(() => habits.id, { onDelete: "set null" }),
  isHelpful: boolean("is_helpful"),
  isRead: boolean("is_read").default(false),
  expiresAt: timestamp("expires_at", { mode: "date" }),
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
  habitEntries: many(habitEntries),
  goals: many(goals),
  aiInsights: many(aiInsights),
  sentFriendRequests: many(friendships, { relationName: "requester" }),
  receivedFriendRequests: many(friendships, { relationName: "addressee" }),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, { fields: [habits.userId], references: [users.id] }),
  entries: many(habitEntries),
  goals: many(goals),
  insights: many(aiInsights),
}));

export const habitEntriesRelations = relations(habitEntries, ({ one }) => ({
  habit: one(habits, { fields: [habitEntries.habitId], references: [habits.id] }),
  user: one(users, { fields: [habitEntries.userId], references: [users.id] }),
}));

export const goalsRelations = relations(goals, ({ one }) => ({
  user: one(users, { fields: [goals.userId], references: [users.id] }),
  habit: one(habits, { fields: [goals.habitId], references: [habits.id] }),
}));

export const friendshipsRelations = relations(friendships, ({ one }) => ({
  requester: one(users, {
    fields: [friendships.requesterId],
    references: [users.id],
    relationName: "requester",
  }),
  addressee: one(users, {
    fields: [friendships.addresseeId],
    references: [users.id],
    relationName: "addressee",
  }),
}));

export const aiInsightsRelations = relations(aiInsights, ({ one }) => ({
  user: one(users, { fields: [aiInsights.userId], references: [users.id] }),
  habit: one(habits, { fields: [aiInsights.habitId], references: [habits.id] }),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Habit = typeof habits.$inferSelect;
export type NewHabit = typeof habits.$inferInsert;
export type HabitEntry = typeof habitEntries.$inferSelect;
export type NewHabitEntry = typeof habitEntries.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
export type Friendship = typeof friendships.$inferSelect;
export type AiInsight = typeof aiInsights.$inferSelect;
