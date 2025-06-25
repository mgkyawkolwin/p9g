import { mysqlTable, int, varchar, serial, timestamp, tinyint, text, datetime } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm"

export const user = mysqlTable("user", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
  userName: varchar("userName", { length: 255 }),
  email: varchar("email", { length: 255 }).notNull().unique(),
  //emailVerified: datetime("emailVerified"),
  //image: varchar("image", { length: 255 }),
  password: varchar("password", { length: 255 }), // Only for credentials provider
  role: varchar("role", { length: 50 }).$type<"ADMIN" | "MANAGER" | "USER">().default("USER"),
  createdAt: timestamp("createdAt").defaultNow(),
  updatedAt: timestamp("updatedAt").onUpdateNow(),
})

// export const accounts = mysqlTable("account", {
//   id: varchar("id", { length: 255 }).primaryKey(),
//   userId: int("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),
//   type: varchar("type", { length: 255 }).notNull(),
//   provider: varchar("provider", { length: 255 }).notNull(),
//   providerAccountId: varchar("providerAccountId", { length: 255 }).notNull(),
//   refresh_token: text("refresh_token"),
//   access_token: text("access_token"),
//   expires_at: int("expires_at"),
//   token_type: varchar("token_type", { length: 255 }),
//   scope: varchar("scope", { length: 255 }),
//   id_token: text("id_token"),
//   session_state: varchar("session_state", { length: 255 }),
// })

// export const sessions = mysqlTable("session", {
//   id: varchar("id", { length: 255 }).primaryKey(),
//   sessionToken: varchar("sessionToken", { length: 255 }).notNull().unique(),
//   userId: int("userId")
//     .notNull()
//     .references(() => user.id, { onDelete: "cascade" }),
//   expires: datetime("expires").notNull(),
// })

// export const verificationTokens = mysqlTable("verificationToken", {
//   identifier: varchar("identifier", { length: 255 }).notNull(),
//   token: varchar("token", { length: 255 }).notNull().unique(),
//   expires: datetime("expires").notNull(),
// })

// // Define relations
// export const usersRelations = relations(user, ({ many }) => ({
//   accounts: many(accounts),
//   sessions: many(sessions),
// }))

// export const accountsRelations = relations(accounts, ({ one }) => ({
//   user: one(user, {
//     fields: [accounts.userId],
//     references: [user.id],
//   }),
// }))

// export const sessionsRelations = relations(sessions, ({ one }) => ({
//   user: one(user, {
//     fields: [sessions.userId],
//     references: [user.id],
//   }),
// }))

// Export TypeScript types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert; // For INSERT queries