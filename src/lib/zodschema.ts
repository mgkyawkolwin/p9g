import { Regex } from 'lucide-react';
import { z } from 'zod';



export const customerUpdateSchema = z.object({
  id: z.string().length(36, "Id is required"),
  name: z.string().min(1, 'Name is required'),
  nationalId: z.string().min(1, 'NationalId is required').optional(),
  passport: z.string().min(1, 'Passport is required').optional(),
  phone: z.string().min(1, 'Phone is required').optional(),
  email: z.string().min(1, 'Email is required').optional(),
  address: z.string().min(1, 'Address is required').optional(),
  country: z.string().min(1, 'Country is required').optional(),
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


export const searchSchema = z.object({
  searchName: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchNationalId: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchPassport: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchPhone: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional().or(z.literal('')),
  searchEmail: z.string().regex(RegExp('[a-zA-Z0-9@ ]'),'Invalid search column.').optional().or(z.literal(''))
});



