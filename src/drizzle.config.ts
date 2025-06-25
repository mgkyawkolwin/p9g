import type { Config } from "drizzle-kit";

export default {
  schema: "./db/orm/drizzle/mysql/schema.ts",
  out: "./drizzle/migrations",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  dialect: "mysql",
  strict: true,
} satisfies Config;