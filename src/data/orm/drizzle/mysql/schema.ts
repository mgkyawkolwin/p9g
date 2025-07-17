import { mysqlTable, int, boolean, char, varchar,  tinyint,date, datetime,decimal } from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import {v4 as uuidv4} from 'uuid';


export const billTable = mysqlTable("bill", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  dateUTC: datetime("dateUTC"),
  reservationId: char("reservationId").notNull(),
  itemName: varchar("itemName", {length: 100}).notNull(),
  unitPrice: decimal("unitPrice").notNull(),
  quantity: tinyint("quantity").notNull(),
  amount: decimal("amount").notNull(),
  isPaid: boolean("isPaid").notNull().default(false),
  paidOnUTC: datetime("paidOnUTC"),
  currency: char("currency", {length:3}),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});


export const configTable = mysqlTable("config", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  group: varchar("group", {length: 50}).notNull(),
  value: varchar("value", {length: 50}).notNull(),
  text: varchar("text", {length: 50}).notNull(),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const customerTable = mysqlTable("customer", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  dob: date("dob"),
  passport: varchar("passport", { length: 50 }).unique(),
  nationalId: varchar("nationalId", { length: 50 }).unique(),
  address: varchar("address", { length: 255 }),
  country: varchar("country", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 50 }).unique(),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const prepaidTable = mysqlTable("prepaid", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  value: varchar("value", {length: 50}).notNull(),
  text: varchar("text", {length: 50}).notNull(),
  days: tinyint("days").notNull(),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const promotionTable = mysqlTable("promotion", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  value: varchar("value", {length: 50}).notNull(),
  text: varchar("text", {length: 50}).notNull(),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const reservationTable = mysqlTable("reservation", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  reservationTypeId: char("reservationTypeId", {length: 36}).references(() => configTable.id),
  arrivalDateTimeUTC: datetime("arrivalDateTimeUTC"),
  arrivalFlight: varchar("arrivalFlight", { length: 50 }),
  departureDateTimeUTC: datetime("departureDateTimeUTC"),
  departureFlight: varchar("departureFlight", { length: 50 }),
  checkInDateUTC: datetime("checkInDateUTC"),
  checkOutDateUTC: datetime("checkOutDateUTC"),
  noOfDays: tinyint("noOfDays"),
  depositAmount: int("depositAmount"),
  depositCurrency: char("depositCurrency", {length: 3}),
  depositDateUTC: date("depositDateUTC"),
  roomNo: varchar("roomNo", {length: 10}),
  noOfGuests: tinyint("noOfGuests"),
  pickUpTypeId: char("pickUpTypeId", {length: 36}).references(() => configTable.id),
  pickUpFee: tinyint("pickUpFee"),
  pickUpCurrency: char("pickUpCurrency", {length: 3}),
  pickUpCarNo: varchar("pickUpCarNo", {length: 10}),
  prepaidPackageId: char("prepaidPackageId", {length: 36}).references(() => prepaidTable.id),
  promotionPackageId: char("promotionPackageId", {length: 36}).references(() => promotionTable.id),
  dropOffTypeId: char("dropOffTypeId", {length: 36}).references(() => configTable.id),
  dropOffFee: tinyint("dropOffFee"),
  dropOffFeeCurrency: char("dropOffFeeCurrency", {length: 3}),
  dropOffCarNo: varchar("dropOffCarNo", {length: 10}),
  reservationStatusId: char("reservationStatusId", {length: 36}).notNull().references(() => configTable.id),
  remark: varchar("remark", {length: 255}),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const reservationCustomerTable = mysqlTable("reservationCustomer", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", {length: 36}).notNull().references(() => reservationTable.id, {onDelete: 'set null'}),
  customerId: char("customerId", {length: 36}).notNull().references(() => customerTable.id, {onDelete: 'set null'}),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const roomTable = mysqlTable("room", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  roomNo: varchar("roomNo", { length: 50 }).notNull().references(() => roomTypeTable.id),
  roomTypeId: char("roomTypeId", {length: 36}).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  isDoubleBed: boolean("isDoubleBed").default(true).notNull(),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const roomReservationTable = mysqlTable("roomReservation", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  roomId: char("roomId", {length: 36}).notNull().references(() => roomTable.id),
  reservationId: char("reservationId", {length: 36}).notNull().references(() => reservationTable.id),
  noOfExtraBed: tinyint().default(0),
  checkInDateUTC: datetime("checkInDateUTC", {mode: 'date', fsp: 3}).notNull(),
  checkOutDateUTC: datetime("checkOutDateUTC", {mode: 'date', fsp: 3}).notNull(), 
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const roomTypeTable = mysqlTable("roomType", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  roomType: varchar("roomType", { length: 50 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const userTable = mysqlTable("user", {
  id: char("id", {length: 36}).$defaultFn(uuidv4).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userName: varchar("userName", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar('password', { length: 100 }).notNull(),
  //role: varchar("role", { length: 50 }).$type<"ADMIN" | "MANAGER" | "USER">().default("USER"),
  role: varchar("role", { length: 50 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", {length: 36}).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", {length: 36}).notNull()
});

export const reservationRelations = relations(reservationTable, ({ one, many }) => ({
  reservationStatus: one(configTable, {
    fields: [reservationTable.reservationStatusId],
    references: [configTable.id],
    relationName: 'reservation_status' // Explicit relation name
  }),
  reservationType: one(configTable, {
    fields: [reservationTable.reservationTypeId],
    references: [configTable.id],
    relationName: 'reservation_type'
  }),
  customers: many(reservationCustomerTable, {
    relationName: 'reservation_to_customers'
  }),
  prepaidPackage: one(prepaidTable, {
    fields: [reservationTable.prepaidPackageId],
    references: [prepaidTable.id]
  }),
  promotionPackage: one(promotionTable, {
    fields: [reservationTable.promotionPackageId],
    references: [promotionTable.id]
  }),
  roomReservation: one(roomReservationTable, {
    fields: [reservationTable.id],
    references: [roomReservationTable.reservationId]
  })
}));

// 2. Fix the reservationCustomer relations
export const reservationCustomerRelations = relations(reservationCustomerTable, ({ one }) => ({
  reservation: one(reservationTable, {
    fields: [reservationCustomerTable.reservationId],
    references: [reservationTable.id],
    relationName: 'reservation_to_customers'
  }),
  customer: one(customerTable, {
    fields: [reservationCustomerTable.customerId],
    references: [customerTable.id]
  })
}));

export const roomSetUpRooomReservationRelations = relations(roomTable, ({ many }) => ({
  reservations: many(reservationTable, {
    relationName: 'roomSetUp_to_reservation'
  })
}));

export const roomSetRoomTypeRelations = relations(roomTable, ({ one }) => ({
  roomType: one(roomTypeTable, {
    fields: [roomTable.roomTypeId],
    references: [roomTypeTable.id],
    relationName: 'roomSetUp_to_roomType'
  })
}));

export const roomReservationRelations = relations(roomReservationTable, ({ one, many }) => ({
  room: one(roomTable, {
    fields: [roomReservationTable.roomId],
    references: [roomTable.id],
    relationName: 'roomReservation_to_roomSetup'
  }),
  reservation: many(reservationTable, {
    relationName: 'roomReservation_to_roomReservation'
  })
}));

// export const reservationConfigReservationStatusRelations = relations(reservationTable, ({ one }) => ({
//   reservationStatus: one(configTable, {
//     fields: [reservationTable.reservationStatusId],
//     references: [configTable.id],
//   }),
// }));

// export const reservationConfigReservationTypeRelations = relations(reservationTable, ({ one }) => ({
//   reservationType: one(configTable, {
//     fields: [reservationTable.reservationTypeId],
//     references: [configTable.id],
//   }),
// }));

// export const reservationReservationCusomterRelations = relations(reservationTable, ({ many }) => ({
//   reservationCustomers: many(reservationCustomerTable),
// }));

// export const reservationCusomterCustomerRelations = relations(reservationCustomerTable, ({ many }) => ({
//   customers: many(customer),
// }));


// export const reservationRelations = relations(reservation, ({ one, many }) => ({
//   reservationType: one(config, {
//     fields: [reservation.reservationTypeId],
//     references: [config.id],
//   }),
//   status: one(config, {
//     fields: [reservation.statusId],
//     references: [config.id],
//   }),
//   customers: many(reservationCustomer),
//   rooms: many(reservationRoom)
// }));

// Export TypeScript types
export type BillEntity = typeof billTable.$inferSelect;
export type UserEntity = typeof userTable.$inferSelect;
export type ConfigEntity = typeof configTable.$inferSelect;
export type CustomerEntity = typeof customerTable.$inferSelect;
export type ReservationEntity = typeof reservationTable.$inferSelect;
export type ReservationCustomerEntity = typeof reservationCustomerTable.$inferSelect;
export type RoomReservationEntity = typeof roomReservationTable.$inferSelect;