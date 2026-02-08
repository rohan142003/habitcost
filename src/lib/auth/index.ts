import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: DrizzleAdapter(db),
  session: { strategy: "jwt" },
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "Demo Account",
      credentials: {
        email: { label: "Email", type: "email" },
      },
      async authorize(credentials) {
        // Demo login for testing
        if (credentials?.email === "demo@habitcost.app") {
          const existingUser = await db
            .select()
            .from(users)
            .where(eq(users.email, "demo@habitcost.app"))
            .limit(1);

          if (existingUser.length > 0) {
            return existingUser[0];
          }

          // Create demo user if doesn't exist
          const [newUser] = await db
            .insert(users)
            .values({
              email: "demo@habitcost.app",
              name: "Demo User",
              hourlyWage: "25.00",
              subscriptionTier: "pro",
            })
            .returning();

          return newUser;
        }
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
});
