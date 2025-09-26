import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SearchParam, PagerParams, SearchFormFields } from "../core/types";
import { CustomError } from "./errors";


/**
 * Build query string from object, filter out invalid values (undefined, null, empty string)
 * @param {object} input - Any object with property.
 * @returns {string} Query string.
 */
export function buildQueryString(input : SearchFormFields | PagerParams): string{
  const queryString = new URLSearchParams(
    Object.entries(input)
      .map(([key, value]) => [key, String(value)])
  ).toString();
  return queryString;
}

/**
 * Calculate the day difference between start date and end date.
 * @param startDate 
 * @param endDate 
 * @returns 
 */
export function calculateDayDifference(startDate:Date, endDate: Date){
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Merge two or more className into one.
 * @param {ClassValue[]}  ...inputs - className array.
 * @returns combined className
 * @example
 * <Button className={cn(className, "flex flex-1")} />;
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get cache key based on based key and tag.
 * @param baseKey 
 * @param tag 
 * @returns 
 */
export function getCacheKey(baseKey: string, tag?: string): string {
        return tag
            ? `${baseKey}:${tag}`
            : `${baseKey}`;
}

/**
 * Get the first date of the current month at time 00:00:00.000
 * @returns 
 */
export function getUTCCurrentMonthFirstDate(): Date{
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1, 0, 0, 0, 0));
}

/**
 * Get the last date of the current month at time 23:59:59.999
 * @returns 
 */
export function getCurrentMonthLastDate(): Date{
  const today = new Date();
  return new Date(Date.UTC(today.getFullYear(), today.getMonth() + 1, 0,23,59,59,999));
}

/**
 * Get the date array between start date and end date.
 * @param startDate 
 * @param endDate 
 * @returns 
 */
export function getDateRange(startDate: string, endDate: string): Date[] {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  // Validate the dates
  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new CustomError('Invalid date format. Please use ISO format (YYYY-MM-DD)');
  }
  
  if (start > end) {
      throw new CustomError('Start date must be before or equal to end date');
  }
  
  const dateArray: Date[] = [];
  const currentDate = new Date(start);
  
  // Loop through each day in the range
  while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return dateArray;
}


/**
 * Get the date with Local Time set at mid night from the input date.
 * @param date 
 * @returns 
 */
export function getLocalDateMidNight(date:Date){
  const midNightDate = new Date(date);
  midNightDate.setHours(23,59,59,999);
  return midNightDate;
}

/**
 * Get the first date of a month in local date at 00:00:00.000 time.
 * 
 * @param year 
 * @param month 
 * @returns 
 */
export function getLocalFirstDate(year: number, month: number): Date{
  return new Date(year, month, 1, 0, 0, 0, 0);
}


/**
 * Get last date of a month in local date at 23:59:59.999 time.
 * @param year 
 * @param month 
 * @returns 
 */
export function getLocalLastDate(year: number, month: number): Date{
  return new Date(year,month + 1, 0, 23, 59, 59, 999);
}

/**
 * Get first date of a month in UTC at 00:00:00.000 time.
 * @param year 
 * @param month 
 * @returns 
 */
export function getUTCFirstDate(year: number, month: number): Date{
  return new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
}

/**
 * Get last date of a month in UTC at 23:59:59.999 time.
 * @param year 
 * @param month 
 * @returns 
 */
export function getUTCLastDate(year: number, month: number): Date{
  return new Date(Date.UTC(year,month + 1, 0, 23, 59, 59, 999));
}

/**
 * Get the date with UTC time set at morning from the input date.
 * @param date 
 * @returns 
 */
export function getUTCDate(date:Date){
  const d = new Date(date);
  d.setUTCHours(0,0,0,0);
  return d;
}

/**
 * Get the date with UTC time set at mid night from the input date.
 * @param date 
 * @returns 
 */
export function getUTCDateMidNight(date:Date){
  const midNightDate = new Date(date);
  midNightDate.setUTCHours(23,59,59,999);
  return midNightDate;
}

/**
 * Create the ISO date string by padding time string.
 * @param dateString in UTC format (1900-01-01)
 * @returns 1900-01-01T00:00:00.000Z
 */
export function getISODateTimeString(dateString:string){
  return `${dateString}T00:00:00.000Z`;
}

/**
 * Create the ISO date string by padding midnight time string.
 * @param dateString in UTC format(1900-01-01)
 * @returns 1900-01-01T23:59:59.999Z
 */
export function getISODateTimeMidNightString(dateString:string){
  return `${dateString}T23:59:59.999Z`;
}
