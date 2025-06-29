import { Regex } from 'lucide-react';
import { z } from 'zod';



export const customerUpdateSchema = z.object({
  id: z.string().length(36, "Id is required"),
  name: z.string().min(1, 'Name is required'),
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
  search_name: z.string().regex(RegExp('[a-zA-Z0-9]'),'Invalid search column.').optional(),
  userName: z.string().regex(RegExp('[a-zA-Z]'),'Invalid search column.').optional(),
  email: z.string().regex(RegExp('[a-zA-Z0-9@ ]'),'Invalid search column.').optional()
});



