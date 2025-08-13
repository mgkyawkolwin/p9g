import { z } from 'zod';
import { RegularExpressions } from './regularExpressions';


export const billValidator = z.object({
  reservationId: z.string(),
  dateUTC: z.coerce.date(),
  itemName: z.string(),
  unitPrice: z.coerce.number().nullish().catch(undefined),
  quantity: z.coerce.number().nullish().catch(undefined),
  amount: z.coerce.number().nullish().catch(undefined),
  currency: z.string(),
  isPaid: z.boolean(),
  paidOnUTC: z.coerce.date().nullish().catch(undefined).optional(),
  paymentType: z.string().min(1)
});


export const customerValidator = z.object({
  id: z.string().nullish().catch(undefined).optional(),
  name: z.string().nullish().catch(undefined).optional(),
  englishName: z.string().nullish().catch(undefined).optional(),
  nationalId: z.string().nullish().catch(undefined).optional(),
  passport: z.string().nullish().catch(undefined).optional(),
  phone: z.string().nullish().catch(undefined).optional(),
  email: z.string().nullish().catch(undefined).optional(),
  country: z.string().nullish().catch(undefined).optional(),
  dob: z.string().nullish().catch(undefined).optional(),
  address: z.string().nullish().catch(undefined).optional()
});

export const userInsertSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  password: z.string().min(1, 'Password is required'),
  email: z.string().min(1, 'Email is required'),
});

export const userSignInSchema = z.object({
  userName: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

export const userCreateSchema = z.object({
  userName: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'),
});

export const userUpdateSchema = z.object({
  id: z.coerce.number(),
  userName: z.string().min(1, 'Name is required'),
  email: z.string().min(1, 'Email is required'),
  password: z.string().min(1, 'Password is required')
});


export const pagerValidator = z.object({
  orderBy: z.string().regex(RegExp('[a-zA-Z]'),'Invalid orderBy column.').optional(),
  orderDirection: z.string().regex(RegExp('asc|desc'),'Invalid search column.').optional(),
  pageIndex: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});


export const paymentValidator = z.object({
  id: z.string().length(36).nullish().catch(undefined).optional(),
  reservationId: z.string().length(36),
  paymentDateUTC: z.coerce.date(),
  amount: z.coerce.number(),
  amountInCurrency: z.coerce.number(),
  currency: z.string().length(3),
  paymentMode: z.string().min(1),
  paymentType: z.string().min(1),
  remark: z.string().nullish().catch(undefined).optional()
});



export const reservationValidator = z.object({
  id: z.coerce.string().min(36,"Id is required").nullish().catch(undefined).optional(),
  arrivalDateTimeUTC: z.coerce.date().nullish().catch(undefined).optional(),
  arrivalFlight: z.coerce.string().optional(),
  checkInDateUTC: z.coerce.date({message:"Check-in date is either missing or incorrect format."}),
  checkOutDateUTC: z.coerce.date({message:"Check-out date is either missing or incorrect format."}),
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
  departureDateTimeUTC: z.coerce.date().nullish().catch(undefined).optional(),
  departureFlight: z.coerce.string().optional(),
  depositAmount: z.coerce.number().optional(),
  depositAmountInCurrency: z.coerce.number().optional(),
  depositCurrency: z.coerce.string().nullish().catch(undefined).optional(),
  depositDateUTC: z.coerce.date().nullish().catch(undefined).optional(),
  discountAmount: z.coerce.number(),
  dropOffType: z.string().optional(),
  isSingleOccupancy: z.coerce.boolean(),
  location: z.coerce.string(),
  noOfDays: z.coerce.number().gt(0, { message: "Number of days must be greater than 0" }),
  noOfGuests: z.coerce.number().gt(0, { message: "Number of guests must be greater than 0" }),
  pickUpType: z.string().optional(),
  prepaidPackage: z.coerce.string().optional(),
  promotionPackage: z.coerce.string().optional(),
  remark: z.coerce.string().optional(),
  reservationStatus: z.string().optional(),
  reservationType: z.string().optional(),
  roomNo: z.coerce.string().optional(),
  tax: z.coerce.number(),
  tourCompany: z.coerce.string().optional(),
});


export const searchSchema = z.object({
  searchId: z.string().nullish().catch(undefined).optional(),
  searchRoomNo: z.string().nullish().catch(undefined).optional(),
  searchArrivalDateTime: z.string().nullish().catch(undefined).optional(),
  searchCreatedDateFrom: z.string().nullish().catch(undefined).optional(),
  searchCreatedDateUntil: z.string().nullish().catch(undefined).optional(),
  searchCheckInDate: z.string().nullish().catch(undefined).optional(),
  searchCheckInDateFrom: z.string().nullish().catch(undefined).optional(),
  searchCheckInDateUntil: z.string().nullish().catch(undefined).optional(),
  searchCheckOutDate: z.string().nullish().catch(undefined).optional(),
  searchDate: z.string().nullish().catch(undefined).optional(),
  date: z.string().nullish().catch(undefined).optional(),
  searchDepartureDateTime: z.string().nullish().catch(undefined).optional(),
  searchEmail: z.string().nullish().catch(undefined).optional(),
  searchName: z.string().nullish().catch(undefined).optional(),
  searchNationalId: z.string().nullish().catch(undefined).optional(),
  searchPassport: z.string().nullish().catch(undefined).optional(),
  searchPhone: z.string().nullish().catch(undefined).optional(),
  searchPrepaidPackage: z.string().optional(),
  searchPromotionPackage: z.string().optional(),
  searchRemark: z.string().optional(),
  searchReservationStatus: z.string().optional(),
  searchReservationType: z.string().optional(),
  searchUserName: z.string().optional(),

});



