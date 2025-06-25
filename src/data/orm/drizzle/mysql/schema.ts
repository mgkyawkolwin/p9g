import { mysqlTable, primaryKey,unique, int, boolean, char, varchar, serial, timestamp, tinyint, text,date, datetime } from "drizzle-orm/mysql-core";
import { relations, sql } from "drizzle-orm";
import {v4 as uuidv4} from 'uuid';


export const config = mysqlTable("config", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  group: varchar("group", {length: 50}).notNull(),
  value: varchar("value", {length: 50}).notNull(),
  text: varchar("text", {length: 50}).notNull(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const customer = mysqlTable("customer", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  dob: date("dob"),
  passport: varchar("passport", { length: 50 }).unique(),
  nationalId: varchar("nationalId", { length: 50 }).unique(),
  address: varchar("address", { length: 255 }),
  country: varchar("country", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 50 }).unique(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const prepaid = mysqlTable("prepaid", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  value: varchar("value", {length: 50}).notNull(),
  text: varchar("text", {length: 50}).notNull(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const promotion = mysqlTable("promotion", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  value: varchar("value", {length: 50}).notNull(),
  text: varchar("text", {length: 50}).notNull(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const reservation = mysqlTable("reservation", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  reservationTypeId: char("reservationTypeId", {length: 36}).notNull(),
  arrivalDateTime: datetime("arrivalDateTime"),
  arrivalFlight: varchar("arrivalFlight", { length: 50 }),
  depertureDateTime: datetime("depertureDateTime"),
  depertureFlight: varchar("depertureFlight", { length: 50 }),
  checkInDate: date("checkInDate"),
  checkOutDate: date("checkOutDate"),
  noOfDays: tinyint("noOfDays"),
  depositAmount: int("depositAmount"),
  depositCurrency: char("depositCurrency", {length: 3}),
  roomNo: varchar("roomNo", {length: 10}),
  pickUpTypeId: char("pickUpTypeId", {length: 36}),
  pickUpFee: tinyint("pickUpFee"),
  pickUpCurrency: char("pickUpCurrency", {length: 3}),
  pickUpCarNo: varchar("pickUpCarNo", {length: 10}),
  dropOffTypeId: char("pickUpTypeId", {length: 36}),
  dropOffFee: tinyint("dropOffFee"),
  dropOffFeeCurrency: char("dropOffFeeCurrency", {length: 3}),
  dropOffCarNo: varchar("dropOffCarNo", {length: 10}),
  statusId: char("statusId", {length: 36}).notNull(),
  remark: varchar("remark", {length: 255}),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const reservationCustomer = mysqlTable("reservationCustomer", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", {length: 36}).notNull(),
  customerId: char("customerId", {length: 36}).notNull(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const reservationRoom = mysqlTable("reservationRoom", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", {length: 36}).notNull(),
  roomId: char("roomId", {length: 36}).notNull(),
  fromDate: date().notNull(),
  toDate: date().notNull(),
  noOfExtraBed: tinyint(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const roomSetUp = mysqlTable("roomSetUp", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  roomNo: varchar("roomNo", { length: 50 }).notNull(),
  roomTypeId: char("roomTypeId", {length: 36}).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isDoubleBed: boolean("isDoubleBed").default(true).notNull(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const roomType = mysqlTable("roomType", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  roomType: varchar("roomType", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});

export const user = mysqlTable("user", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userName: varchar("userName", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar('password', { length: 100 }).notNull(),
  //role: varchar("role", { length: 50 }).$type<"ADMIN" | "MANAGER" | "USER">().default("USER"),
  role: varchar("role", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt", {mode: 'date', fsp: 3}),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAt: timestamp("updatedAt", {mode: 'date', fsp: 3}),
  updatedBy: char("updatedBy", {length: 36}).notNull(),
});


export const reservationRelations = relations(reservation, ({ one, many }) => ({
  reservationType: one(config, {
    fields: [reservation.reservationTypeId],
    references: [config.id],
  }),
  status: one(config, {
    fields: [reservation.statusId],
    references: [config.id],
  }),
  customers: many(reservationCustomer),
  rooms: many(reservationRoom)
}));

// Export TypeScript types
export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert; // For INSERT queries