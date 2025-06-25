import { Column, Table } from "drizzle-orm";

// Base interface for all tables
export default interface IDrizzleTable extends Table{
  // Add other common columns if needed
  id:Column;
}