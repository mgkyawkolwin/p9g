import { z } from 'zod';


export const billValidator = z.object({
  id: z.coerce.string().length(36),
  reservationId: z.coerce.string(),
  dateUTC: z.coerce.date(),
  itemName: z.coerce.string(),
  unitPrice: z.coerce.number(),
  quantity: z.coerce.number(),
  amount: z.coerce.number(),
  currency: z.coerce.string().nullish().catch(undefined),
  isPaid: z.coerce.boolean(),
  paidOnUTC: z.coerce.date().nullish().catch(undefined).optional(),
  paymentType: z.coerce.string(),
  paymentMode: z.coerce.string(),
  modelState: z.string()
});


export const customerValidator = z.object({
  id: z.string().length(36),
  name: z.string().nullish().optional(),
  englishName: z.string().nullish().optional(),
  gender: z.string(),
  nationalId: z.string().nullish().optional(),
  passport: z.string().nullish().optional(),
  phone: z.string().nullish().optional(),
  email: z.string().nullish().optional(),
  country: z.string().nullish().optional(),
  dob: z.string().nullish().catch(undefined).optional(),
  address: z.string().nullish().optional(),
  modelState: z.string().optional()
});


export const feedbackValidator = z.object({
  id: z.coerce.string().length(36).optional(),
  reservationId: z.coerce.string().optional(),
  customerId: z.coerce.string().optional(),
  feedback: z.coerce.string().optional(),
});

export const userInsertSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(1, 'Password is required'),
  email: z.string().min(1, 'Email is required'),
  modelState: z.string().optional()
});

export const userSignInSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  modelState: z.string().optional()
});

export const userCreateSchema = z.object({
  userName: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'),
  modelState: z.string().optional()
});

export const userUpdateSchema = z.object({
  id: z.coerce.number(),
  userName: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required'),
  modelState: z.string()
});


export const pagerValidator = z.object({
  orderBy: z.string().regex(RegExp('[a-zA-Z]'),'Invalid orderBy column.').optional(),
  orderDirection: z.string().regex(RegExp('asc|desc'),'Invalid search column.').optional(),
  pageIndex: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional()
});


export const paymentValidator = z.object({
  id: z.string().length(36),
  reservationId: z.string().length(36),
  paymentDateUTC: z.coerce.date(),
  amount: z.coerce.number(),
  amountInCurrency: z.coerce.number(),
  currency: z.string().length(3),
  paymentMode: z.string().min(1),
  paymentType: z.string().min(1),
  remark: z.string().nullish().optional(),
  modelState: z.string()
});


export const reservationPatchValidator = z.object({
  id: z.coerce.string().length(36),
  golfCart: z.coerce.string().optional(),
});


export const reservationValidator = z.object({
  id: z.coerce.string().length(36),
  arrivalDateTime: z.coerce.date(),
  arrivalFlight: z.coerce.string().nullish(),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  customers: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        try {
          return JSON.parse(val);
        } catch {
          return [];
        }
      }
      return val;
    },
    z.array(
      z.object({
      id: z.string().min(1, "Customer ID is required")
    })
  ).optional()
  ),
  departureDateTime: z.coerce.date(),
  departureFlight: z.coerce.string().nullish(),
  depositAmount: z.coerce.number(),
  depositAmountInCurrency: z.coerce.number(),
  depositCurrency: z.coerce.string().nullish(),
  depositDateUTC: z.coerce.date().nullish().catch(undefined),
  discountAmount: z.coerce.number(),
  depositPaymentMode: z.coerce.string().nullish(),
  dropOffType: z.coerce.string().nullish(),
  isSingleOccupancy: z.coerce.boolean(),
  location: z.coerce.string().optional(),
  noOfDays: z.coerce.number().gt(0),
  noOfGuests: z.coerce.number().gt(0),
  paidAmount: z.coerce.number(),
  pickUpType: z.coerce.string().nullish(),
  prepaidCode: z.coerce.string().nullish(),
  prepaidPackage: z.coerce.string().nullish(),
  promotionPackage: z.coerce.string().nullish(),
  remark: z.coerce.string().nullish().catch(undefined),
  reservationStatus: z.string().nullish(),
  reservationType: z.string().nullish(),
  roomNo: z.coerce.string().nullish(),
  tax: z.coerce.number(),
  tourCompany: z.coerce.string().nullish(),
  modelState: z.coerce.string(),
});


export const roomChargeValidator = z.object({
  id: z.string().length(36).nullish().catch(undefined).optional(),
  endDate: z.coerce.date(),
  extraBedRate: z.coerce.number(),
  noOfDays: z.coerce.number(),
  reservationId: z.string().length(36),
  roomId: z.string().optional(),
  roomRate: z.coerce.number(),
  roomSurcharge: z.coerce.number(),
  roomTypeId: z.string().optional(),
  seasonSurcharge: z.coerce.number(),
  singleRate: z.coerce.number(),
  startDate: z.coerce.date(),
  totalRate: z.coerce.number(),
  totalAmount: z.coerce.number(),
  modelState: z.string().optional()
});


export const roomReservationValidator = z.object({
  id: z.string().length(36).nullish().catch(undefined).optional(),
  checkInDate: z.coerce.date(),
  checkOutDate: z.coerce.date(),
  isSingleOccupancy: z.coerce.boolean(),
  noOfExtraBed: z.coerce.number(),
  reservationId: z.string().length(36),
  roomId: z.string().length(36).nullish().catch(undefined).optional(),
  roomNo: z.string(),
  modelState: z.string().optional()
});


export const searchValidator = z.object({
  date: z.coerce.string().optional(),
  drawDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  modelState: z.string().optional(),
  searchId: z.string().optional(),
  searchRoomNo: z.string().optional(),
  searchArrivalDateTime: z.coerce.string().optional(),
  searchCreatedDateFrom: z.coerce.string().optional(),
  searchCreatedDateUntil: z.coerce.string().optional(),
  searchCheckInDate: z.coerce.string().optional(),
  searchCheckInDateFrom: z.coerce.string().optional(),
  searchCheckInDateUntil: z.coerce.string().optional(),
  searchCheckOutDate: z.coerce.string().optional(),
  searchDate: z.coerce.string().optional(),
  searchDepartureDateTime: z.coerce.string().optional(),
  searchEmail: z.string().optional(),
  searchExistingReservations: z.string().optional(),
  searchName: z.string().optional(),
  searchNationalId: z.string().optional(),
  searchPassport: z.string().optional(),
  searchPhone: z.string().optional(),
  searchPrepaidPackage: z.string().optional(),
  searchPromotionPackage: z.string().optional(),
  searchRemark: z.string().optional(),
  searchReservationStatus: z.string().optional(),
  searchReservationType: z.string().optional(),
  searchUserName: z.string().optional(),
  startDate: z.coerce.date().optional()
});

export const pookieActivateValidator = z.object({
  key: z.coerce.string(),
  deviceId: z.coerce.string()
});

export const pookieDrawValidator = z.object({
  drawDate: z.coerce.date(),
  noOfPeople: z.coerce.number(),
  rooms: z.coerce.string()
});

export const pookieGenerateValidator = z.object({
  drawDate: z.coerce.date(),
  endDate: z.coerce.date(),
  startDate: z.coerce.date()
});

export const pookieGetResultValidator = z.object({
  drawDate: z.coerce.date(),
  roomName: z.coerce.string()
});

export const pookieGetValidator = z.object({
  drawDate: z.coerce.date()
});

export const pookieGetRoomValidator = z.object({
  list: z.coerce.string().optional(),
  drawDate: z.coerce.date(),
  location: z.coerce.string()
});

export const pookieValidator = z.object({
  id: z.coerce.string(),
  date: z.coerce.date(),
  hole: z.coerce.string(),
  isBusy: z.coerce.boolean(),
  location: z.coerce.string(),
  noOfPeople: z.coerce.number(),
  rooms: z.coerce.string(),
  time: z.coerce.date(),
  modelState: z.coerce.string(),
  createdAtUTC: z.coerce.date(),
  createdBy: z.coerce.string(),
  updatedAtUTC: z.coerce.date(),
  updatedBy: z.coerce.string()
});