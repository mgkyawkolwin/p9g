import { Column, Table } from "drizzle-orm";

// Base interface for all tables
export default interface IEntity{
  // Add other common columns if needed
  id:string;
  createdAtUTC: Date;
  createdBy: string;
  updatedAtUTC?: Date;
  updatedBy?: string;
}