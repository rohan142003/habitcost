import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Connection string - will be undefined during build but that's OK
// since we won't actually make DB calls during build
const connectionString = process.env.DATABASE_URL || "postgresql://localhost:5432/placeholder";

// Create postgres client
const client = postgres(connectionString, { prepare: false });

// Create drizzle instance
export const db = drizzle(client, { schema });

export * from "./schema";
