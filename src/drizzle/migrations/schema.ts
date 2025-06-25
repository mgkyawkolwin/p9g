import { mysqlTable, mysqlSchema, AnyMySqlColumn, primaryKey, int, varchar, timestamp, unique, serial } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const customer = mysqlTable("customer", {
	id: int({ unsigned: true }).autoincrement().notNull(),
	name: varchar({ length: 100 }).notNull(),
	passport: varchar({ length: 50 }),
	nationalId: varchar({ length: 50 }),
	phone: varchar({ length: 100 }),
	email: varchar({ length: 100 }),
	address: varchar({ length: 255 }),
	country: varchar({ length: 50 }).notNull(),
	createdAt: timestamp({ mode: 'string' }).onUpdateNow().notNull(),
	createdBy: int({ unsigned: true }).notNull(),
	updatedAt: timestamp({ mode: 'string' }).onUpdateNow().notNull(),
	updatedBy: int({ unsigned: true }).notNull(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "customer_id"}),
]);

export const user = mysqlTable("user", {
	id: serial().notNull(),
	name: varchar({ length: 255 }),
	userName: varchar({ length: 255 }),
	email: varchar({ length: 255 }).notNull(),
	password: varchar({ length: 255 }),
	role: varchar({ length: 50 }).default('USER'),
	createdAt: timestamp({ mode: 'string' }).default(sql`(now())`),
	updatedAt: timestamp({ mode: 'string' }).onUpdateNow(),
},
(table) => [
	primaryKey({ columns: [table.id], name: "user_id"}),
	unique("id").on(table.id),
	unique("user_email_unique").on(table.email),
]);
