import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { type MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const poolConnection = mysql.createPool({
  uri: process.env.DATABASE_URL!,
});

export type DBType = MySql2Database<typeof schema>;

export const db: DBType = drizzle(poolConnection, { 
  schema, 
  mode: "default" 
});

export type TransactionType = Parameters<Parameters<DBType["transaction"]>[0]>[0];