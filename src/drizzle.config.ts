import "dotenv/config";
import type { Config } from "drizzle-kit";

export default {
  schema: "./core/orms/drizzle/mysql/schema.ts",
  out: "./migrations/drizzle-generated",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: "mysql",
  strict: true,
} satisfies Config;