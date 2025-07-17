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
  paidOnUTC: z.coerce.date().nullish().catch(undefined).optional()
});


export const customerValidator = z.object({
  id: z.string().nullish().catch(undefined).optional(),
  name: z.string().nullish().catch(undefined).optional(),
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


export const pagerSchema = z.object({
  orderBy: z.string().regex(RegExp('[a-zA-Z]'),'Invalid orderBy column.').optional(),
  orderDirection: z.string().regex(RegExp('asc|desc'),'Invalid search column.').optional(),
  pageIndex: z.coerce.number().optional(),
  pageSize: z.coerce.number().optional(),
});



export const reservationValidator = z.object({
  id: z.string().min(1,"Id is required").optional(),
  arrivalDateTimeUTC: z.coerce.date().nullish().catch(undefined).optional(),
  arrivalFlight: z.coerce.string().optional(),
  checkInDateUTC: z.coerce.date(),
  checkOutDateUTC: z.coerce.date(),
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
  depositCurrency: z.coerce.string().nullish().catch(undefined).optional(),
  depositDateUTC: z.coerce.date().nullish().catch(undefined).optional(),
  dropOffType: z.string().optional(),
  noOfDays: z.coerce.number(),
  noOfGuests: z.coerce.number().optional(),
  pickUpType: z.string().optional(),
  prepaidPackage: z.string().optional(),
  promotionPackage: z.string().optional(),
  remark: z.coerce.string().optional(),
  reservationStatus: z.string().optional(),
  reservationType: z.string().optional(),
  roomNo: z.coerce.string().optional(),
});


export const searchSchema = z.object({
  searchId: z.string().optional(),
  searchRoomNo: z.string().optional(),
  searchCreatedFrom: z.string().optional(),
  searchCreatedUntil: z.string().optional(),
  searchCheckInDateUTC: z.string().optional(),
  searchCheckInDateUTCFrom: z.string().optional(),
  searchCheckInDateUTCTo: z.string().optional(),
  searchCheckOutDateUTC: z.string().optional(),
  searchDate: z.string().regex(RegExp('\d{4}-\d{2}-\d{2}')).optional().or(z.literal('')),
  date: z.string().optional(),
  searchEmail: z.string().regex(RegExp('[a-zA-Z0-9@ ]'),'Invalid search column.').optional().or(z.literal('')),
  searchName: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchNationalId: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchPassport: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchPhone: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchPrepaidPackage: z.string().optional(),
  searchPromotionPackage: z.string().optional(),
  searchReservationStatus: z.string().optional(),
  searchReservationType: z.string().optional(),
  searchUserName: z.string().optional(),

});



