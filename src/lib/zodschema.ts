import { Regex } from 'lucide-react';
import { number, z } from 'zod';
import { RegularExpressions } from './regularExpressions';



export const customerValidator = z.object({
  id: z.string().length(36, "Id is required").nullish().catch(undefined).optional(),
  dob: z.date().nullish().catch(undefined).optional(),
  name: z.string().regex(RegExp(RegularExpressions.name)).optional(),
  nationalId: z.string().regex(RegExp(RegularExpressions.nationalId)).optional(),
  passport: z.string().regex(RegExp(RegularExpressions.passport)).optional(),
  phone: z.string().regex(RegExp(RegularExpressions.phone)).optional(),
  email: z.string().regex(RegExp(RegularExpressions.email)).optional(),
  address: z.string().regex(RegExp(RegularExpressions.address)).optional(),
  country: z.string().regex(RegExp(RegularExpressions.country)).optional(),
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
  depositCurrency: z.coerce.string().min(1, "Deposity currency is required.").optional(),
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
  searchName: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchNationalId: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchPassport: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchPhone: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchEmail: z.string().regex(RegExp('[a-zA-Z0-9@ ]'),'Invalid search column.').optional().or(z.literal(''))
});



