import { relations } from "drizzle-orm";
import { binary, boolean, char, date, datetime, decimal, int, mysqlTable, smallint, tinyint, varchar, text } from "drizzle-orm/mysql-core";
import { v4 as uuidv4 } from 'uuid';


export const billTable = mysqlTable("bill", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  dateUTC: datetime("dateUTC"),
  paymentMode: varchar("paymentMode", { length: 10 }).notNull(),
  paymentType: varchar("paymentType", { length: 10 }).notNull(),
  reservationId: char("reservationId").notNull().references(() => reservationTable.id, { onDelete: 'set null' }),
  itemName: varchar("itemName", { length: 100 }).notNull(),
  unitPrice: decimal("unitPrice").notNull(),
  quantity: tinyint("quantity").notNull(),
  amount: decimal("amount").notNull(),
  isPaid: boolean("isPaid").notNull(),
  paidOnUTC: datetime("paidOnUTC"),
  currency: char("currency", { length: 3 }),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});


export const configTable = mysqlTable("config", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  group: varchar("group", { length: 50 }).notNull(),
  value: varchar("value", { length: 50 }).notNull(),
  text: varchar("text", { length: 50 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const customerTable = mysqlTable("customer", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  name: varchar("name", { length: 255 }),
  englishName: varchar("englishName", { length: 255 }).notNull(),
  dob: varchar("dob", { length: 50 }),
  passport: varchar("passport", { length: 50 }),
  nationalId: varchar("nationalId", { length: 50 }),
  gender: varchar("gender", { length: 10 }),
  address: varchar("address", { length: 255 }),
  remarks: varchar("remarks", { length: 1024 }),
  country: varchar("country", { length: 50 }),
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 50 }),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const feedbackTable = mysqlTable("feedback", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", { length: 36 }).notNull().references(() => reservationTable.id, { onDelete: 'restrict' } ),
  customerId: char("customerId", { length: 36 }).references(() => customerTable.id, { onDelete: 'restrict' } ),
  feedback: text("feedback"),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const logErrorTable = mysqlTable("logError", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  userId: char("userId", { length: 36 }),
  datetime: datetime("datetime").notNull(),
  detail: decimal("detail").notNull()
});

export const mediaTable = mysqlTable("media", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", { length: 36 }).notNull().references(() => reservationTable.id, { onDelete: 'restrict' } ),
  customerId: char("customerId", { length: 36 }).references(() => customerTable.id, { onDelete: 'set null' } ),
  url: varchar("url", { length: 500 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const paymentTable = mysqlTable("payment", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", { length: 36 }).notNull(),
  paymentDateUTC: datetime("paymentDateUTC").notNull(),
  paymentType: varchar("paymentType", { length: 10 }).notNull(),
  amount: decimal("amount").notNull(),
  amountInCurrency: decimal("amountInCurrency").notNull(),
  currency: char("currency", { length: 3 }).notNull(),
  paymentMode: varchar("paymentMode", { length: 10 }).notNull(),
  remark: varchar("remark", { length: 200 }),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const pookieTable = mysqlTable("pookie", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  date: datetime("date", { mode: 'date', fsp: 3 }).notNull(),
  hole: varchar("hole", { length: 10 }).notNull(),
  isBusy: boolean("isBusy").notNull(),
  location: varchar("location", { length: 10 }).notNull(),
  noOfPeople: tinyint("noOfPeople").notNull(),
  rooms: varchar("rooms", { length: 50 }).notNull(),
  time: datetime("time", { mode: 'date', fsp: 3 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const pookieConfigTable = mysqlTable("pookieConfig", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  contactUrl: varchar("contactUrl", {length: 500}).notNull(),
  key: char("key", {length: 36}).notNull(),
  version: varchar("version", {length: 10}).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const pookieDeviceTable = mysqlTable("pookieDevice", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  deviceId: varchar("deviceId", {length: 50}).notNull(),
  isBlocked: boolean("isBlocked").notNull(),
  lastRequestAtUTC: datetime("lastRequestAtUTC", { mode: 'date', fsp: 3 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

// export const prepaidCodeTable = mysqlTable("prepaidCode", {
//   id: char("id", {length: 36}).primaryKey(),
//   prepaidCode: char("prepaidCode", {length: 8}).notNull(),
//   totalDays: int("totalDays").notNull(),
//   usedDays: int("usedDays").notNull(),
//   balanceDays: int('balanceDays').notNull(),
//   startDate: datetime("startDate", {mode: 'date', fsp: 3}).notNull(),
//   endDate: datetime("endDate", {mode: 'date', fsp: 3}).notNull(),
//   renewDate: datetime("renewDate").notNull(),
//   createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
//   createdBy: char("createdBy", {length: 36}).notNull(),
//   updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
//   updatedBy: char("updatedBy", {length: 36}).notNull()
// });

// export const prepaidCodeRenewHistoryTable = mysqlTable("prepaidCodeHistory", {
//   id: char("id", {length: 36}).primaryKey(),
//   reservationId: char("reservationId", {length: 36}).notNull(),
//   prepaidCodeId: char("prepaidCodeId", {length: 8}).primaryKey(),
//   totalDays: int("totalDays").notNull(),
//   usedDays: int("usedDays").notNull(),
//   balanceDays: int('balanceDays').notNull(),
//   startDate: datetime("startDate", {mode: 'date', fsp: 3}).notNull(),
//   endDate: datetime("endDate", {mode: 'date', fsp: 3}).notNull(),
//   renewDate: datetime("renewDate").notNull(),
//   createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
//   createdBy: char("createdBy", {length: 36}).notNull(),
//   updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
//   updatedBy: char("updatedBy", {length: 36}).notNull()
// });

// export const prepaidCodeUsageHistoryTable = mysqlTable("prepaidCodeUsageHistory", {
//   id: char("id", {length: 36}).primaryKey(),
//   prepaidCodeId: char("prepaidCodeId", {length: 8}).primaryKey(),
//   totalDays: int("totalDays").notNull(),
//   usedDays: int("usedDays").notNull(),
//   balanceDays: int('balanceDays').notNull(),
//   startDate: datetime("startDate", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
//   endDate: datetime("endDate", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
//   createdAtUTC: datetime("createdAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).notNull(),
//   createdBy: char("createdBy", {length: 36}).notNull(),
//   updatedAtUTC: datetime("updatedAtUTC", {mode: 'date', fsp: 3}).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
//   updatedBy: char("updatedBy", {length: 36}).notNull()
// });

export const prepaidTable = mysqlTable("prepaid", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  value: varchar("value", { length: 50 }).notNull(),
  text: varchar("text", { length: 50 }).notNull(),
  days: tinyint("days").notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const promotionTable = mysqlTable("promotion", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  value: varchar("value", { length: 50 }).notNull(),
  text: varchar("text", { length: 50 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const reservationTable = mysqlTable("reservation", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  reservationTypeId: char("reservationTypeId", { length: 36 }).references(() => configTable.id),
  tourCompany: varchar("tourCompany", { length: 100 }),
  arrivalDateTime: datetime("arrivalDateTime"),
  arrivalFlight: varchar("arrivalFlight", { length: 50 }),
  bookingSource: varchar("bookingSource", { length: 50}),
  departureDateTime: datetime("departureDateTime"),
  departureFlight: varchar("departureFlight", { length: 50 }),
  checkInDate: datetime("checkInDate"),
  checkOutDate: datetime("checkOutDate"),
  noOfDays: smallint("noOfDays"),
  depositAmount: int("depositAmount"),
  depositAmountInCurrency: int("depositAmountInCurrency"),
  depositCurrency: char("depositCurrency", { length: 3 }),
  depositDateUTC: date("depositDateUTC"),
  depositPaymentMode: varchar("depositPaymentMode", { length: 10 }),
  roomNo: varchar("roomNo", { length: 10 }),
  isSingleOccupancy: boolean("isSingleOccupancy"),
  noOfGuests: tinyint("noOfGuests"),
  pickUpTypeId: char("pickUpTypeId", { length: 36 }).references(() => configTable.id),
  pickUpFee: tinyint("pickUpFee"),
  pickUpFeeCurrency: char("pickUpFeeCurrency", { length: 3 }),
  pickUpFeePaidOnUTC: datetime("pickUpFeePaidOnUTC"),
  pickUpCarNo: varchar("pickUpCarNo", { length: 10 }),
  pickUpDriver: varchar("pickUpDriver", { length: 50 }),
  prepaidCode: char('prepaidCode', { length: 8 }),
  prepaidPackageId: char("prepaidPackageId", { length: 36 }).references(() => prepaidTable.id),
  promotionPackageId: char("promotionPackageId", { length: 36 }).references(() => promotionTable.id),
  dropOffTypeId: char("dropOffTypeId", { length: 36 }).references(() => configTable.id),
  dropOffFee: tinyint("dropOffFee"),
  dropOffFeeCurrency: char("dropOffFeeCurrency", { length: 3 }),
  dropOffFeePaidOnUTC: datetime("dropOffFeePaidOnUTC"),
  dropOffCarNo: varchar("dropOffCarNo", { length: 10 }),
  dropOffDriver: varchar("dropOffDriver", { length: 50 }),
  reservationStatusId: char("reservationStatusId", { length: 36 }).notNull().references(() => configTable.id),
  remark: varchar("remark", { length: 500 }),
  totalAmount: decimal("totalAmount"),
  paidAmount: decimal("paidAmount"),
  discountAmount: decimal("discountAmount"),
  tax: decimal("tax"),
  taxAmount: decimal("taxAmount"),
  netAmount: decimal("netAmount"),
  dueAmount: decimal("dueAmount"),
  golfCart: varchar("golfCart", { length: 20 }),
  // feedback: text("feedback"),
  location: varchar("location", { length: 10 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const reservationCustomerTable = mysqlTable("reservationCustomer", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", { length: 36 }).notNull().references(() => reservationTable.id, { onDelete: 'set null' }),
  customerId: char("customerId", { length: 36 }).notNull().references(() => customerTable.id, { onDelete: 'set null' }),
  tdacFileUrl: varchar("tdacFileUrl", {length: 50}),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const roomTable = mysqlTable("room", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  roomNo: varchar("roomNo", { length: 50 }).notNull().references(() => roomTypeTable.id),
  roomTypeId: char("roomTypeId", { length: 36 }).notNull(),
  isAvailable: boolean("isAvailable").default(true).notNull(),
  location: varchar("location", { length: 10 }),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const roomChargeTable = mysqlTable("roomCharge", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  reservationId: char("reservationId", { length: 36 }).notNull().references(() => reservationTable.id, { onDelete: 'set null' }),
  startDate: datetime("startDate"),
  endDate: datetime("endDate"),
  roomId: char("roomId"),
  roomTypeId: char("roomTypeId", { length: 36 }).notNull(),
  roomRate: decimal("roomRate").notNull(),
  roomSurcharge: decimal("roomSurcharge").notNull(),
  singleRate: decimal("singleRate").notNull(),
  seasonSurcharge: decimal("seasonSurcharge").notNull(),
  extraBedRate: decimal("extraBedRate").notNull(),
  totalRate: decimal("totalRate").notNull(),
  noOfDays: tinyint("noOfDays").notNull(),
  totalAmount: decimal("totalAmount").notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const roomReservationTable = mysqlTable("roomReservation", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  roomId: char("roomId", { length: 36 }).notNull().references(() => roomTable.id),
  reservationId: char("reservationId", { length: 36 }).notNull().references(() => reservationTable.id),
  noOfExtraBed: tinyint().default(0),
  checkInDate: datetime("checkInDate", { mode: 'date', fsp: 3 }).notNull(),
  checkOutDate: datetime("checkOutDate", { mode: 'date', fsp: 3 }).notNull(),
  isSingleOccupancy: boolean("isSingleOccupancy"),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const roomRateTable = mysqlTable("roomRate", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  roomTypeId: char("roomTypeId", { length: 36 }).notNull(),
  roomRate: decimal("roomRate").notNull(),
  singleRate: decimal("singleRate").notNull(),
  roomSurcharge: decimal("roomSurcharge").notNull(),
  seasonSurcharge: decimal("seasonSurcharge").notNull(),
  extraBedRate: decimal("extraBedRate").notNull(),
  month: tinyint("month").notNull(),
  location: varchar("location", { length: 10 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const roomTypeTable = mysqlTable("roomType", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  roomType: varchar("roomType", { length: 50 }).notNull(),
  roomTypeText: varchar("roomTypeText", { length: 50 }).notNull(),
  maxOccupancy: tinyint("maxOccupancy"),
  isDoubleBed: binary("isDoubleBed"),
  location: varchar("location", { length: 10 }),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const userTable = mysqlTable("user", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  userName: varchar("userName", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).unique(),
  password: varchar('password', { length: 100 }).notNull(),
  //role: varchar("role", { length: 50 }).$type<"ADMIN" | "MANAGER" | "USER">().default("USER"),
  role: varchar("role", { length: 50 }).notNull(),
  location: varchar("location", { length: 10 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const versionTable = mysqlTable("version", {
  id: char("id", { length: 36 }).$defaultFn(uuidv4).primaryKey(),
  version: varchar("version", { length: 10 }).notNull(),
  createdAtUTC: datetime("createdAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).notNull(),
  createdBy: char("createdBy", { length: 36 }).notNull(),
  updatedAtUTC: datetime("updatedAtUTC", { mode: 'date', fsp: 3 }).$defaultFn(() => new Date()).$onUpdateFn(() => new Date()).notNull(),
  updatedBy: char("updatedBy", { length: 36 }).notNull()
});

export const reservationRelations = relations(reservationTable, ({ one, many }) => ({
  bills: many(billTable),
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
  reservationCustomers: many(reservationCustomerTable, {
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
  roomCharges: many(roomChargeTable),
  roomReservation: one(roomReservationTable, {
    fields: [reservationTable.id],
    references: [roomReservationTable.reservationId]
  })
}));

// 2. Fix the reservationCustomer relations
export const roomChargeReservationRelations = relations(roomChargeTable, ({ one }) => ({
  reservation: one(reservationTable, {
    fields: [roomChargeTable.reservationId],
    references: [reservationTable.id]
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


// Export TypeScript types
// export type BillEntity = typeof billTable.$inferSelect;
// export type UserEntity = typeof userTable.$inferSelect;
// export type ConfigEntity = typeof configTable.$inferSelect;
// export type CustomerEntity = typeof customerTable.$inferSelect;
// export type LogErrorEntity = typeof logErrorTable.$inferSelect;
// export type PaymentEntity = typeof paymentTable.$inferSelect;
// export type ReservationEntity = typeof reservationTable.$inferSelect;
// export type ReservationCustomerEntity = typeof reservationCustomerTable.$inferSelect;
// export type RoomEntity = typeof roomTable.$inferSelect;
// export type RoomChargeEntity = typeof roomChargeTable.$inferSelect;
// export type RoomRateEntity = typeof roomRateTable.$inferSelect;
// export type RoomTypeEntity = typeof roomTypeTable.$inferSelect;
// export type RoomReservationEntity = typeof roomReservationTable.$inferSelect;