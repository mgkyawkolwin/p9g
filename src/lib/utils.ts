//ordered import
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SearchParam, PagerParams, SearchFormFields } from "./types"
import c from "./core/logger/ConsoleLogger";
import { CustomError } from "./errors";

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
 * Build SearchParam array from the querystring, which will be used in repository filtering.
 * Query string field should be start with search (e.g. searchName) to be distinguished from
 * entity values. Only known list will be converted into SearchParam.
 * 
 * Note: Intendted to be used in API route.
 * @param {Object} queryStringObject - Query string object with key/value.
 * @returns {SearchParam[]} - Array of SearchParam.
 */
export function buildSearchParams(queryStringObject : SearchFormFields) : SearchParam[] {
  const search : SearchParam[]= [];
  if(queryStringObject.searchArrivalDateTime){
    search.push({searchColumn:'arrivalDateTimeUTC', searchValue: queryStringObject.searchArrivalDateTime});
  }
  if(queryStringObject.searchCheckInDate){
    search.push({searchColumn:'checkInDateUTC', searchValue: queryStringObject.searchCheckInDate});
  }
  if(queryStringObject.searchCheckInDateFrom){
    search.push({searchColumn:'checkInDateFrom', searchValue: queryStringObject.searchCheckInDateFrom});
  }
  if(queryStringObject.searchCheckInDateUntil){
    search.push({searchColumn:'checkInDateUntil', searchValue: queryStringObject.searchCheckInDateUntil});
  }
  if(queryStringObject.searchCheckOutDate){
    search.push({searchColumn:'checkOutDateUTC', searchValue: queryStringObject.searchCheckOutDate});
  }
  if(queryStringObject.searchCreatedDateFrom){
    search.push({searchColumn:'createdFrom', searchValue: queryStringObject.searchCreatedDateFrom});
  }
  if(queryStringObject.searchCreatedDateUntil){
    search.push({searchColumn:'createdUntil', searchValue: queryStringObject.searchCreatedDateUntil});
  }
  if(queryStringObject.date){
    search.push({searchColumn:'date', searchValue: queryStringObject.date});
  }
  if(queryStringObject.searchDate){
    search.push({searchColumn:'date', searchValue: queryStringObject.searchDate});
  }
  if(queryStringObject.searchDepartureDateTime){
    search.push({searchColumn:'departureDateTimeUTC', searchValue: queryStringObject.searchDepartureDateTime});
  }
  if(queryStringObject.searchId){
    search.push({searchColumn:'id', searchValue: queryStringObject.searchId});
  }
  if(queryStringObject.searchName){
    search.push({searchColumn:'name', searchValue: queryStringObject.searchName});
  }
  if(queryStringObject.searchNationalId){
    search.push({searchColumn:'nationalId', searchValue: queryStringObject.searchNationalId});
  }
  if(queryStringObject.searchPassport){
    search.push({searchColumn:'passport', searchValue: queryStringObject.searchPassport});
  }
  if(queryStringObject.searchPhone){
    search.push({searchColumn:'phone', searchValue: queryStringObject.searchPhone});
  }
  if(queryStringObject.searchPrepaidPackage){
    search.push({searchColumn:'prepaidPackage', searchValue: queryStringObject.searchPrepaidPackage});
  }
  if(queryStringObject.searchPromotionPackage){
    search.push({searchColumn:'promotionPackage', searchValue: queryStringObject.searchPromotionPackage});
  }
  if(queryStringObject.searchRemark){
    search.push({searchColumn:'remark', searchValue: queryStringObject.searchRemark});
  }
  if(queryStringObject.searchReservationStatus){
    search.push({searchColumn:'reservationStatus', searchValue: queryStringObject.searchReservationStatus});
  }
  if(queryStringObject.searchReservationType){
    search.push({searchColumn:'reservationType', searchValue: queryStringObject.searchReservationType});
  }
  if(queryStringObject.searchUserName){
    search.push({searchColumn:'userName', searchValue: queryStringObject.searchUserName});
  }
  if(queryStringObject.searchEmail){
    search.push({searchColumn:'email', searchValue: queryStringObject.searchEmail});
  }
  return search.filter((s) => s.searchValue !== 'DEFAULT');
}


/**
 * Build query string from object, filter out invalid values (undefined, null, empty string)
 * @param {object} input - Any object with property.
 * @returns {string} Query string.
 */
export function buildQueryString(input : SearchFormFields | PagerParams): string{
  const queryString = new URLSearchParams(
    Object.entries(input)
      //.filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();
  return queryString;
}


export function calculateDayDifference(startDate:Date, endDate: Date){
  return Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}


export function getCurrentMonthFirstDate(): Date{
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), 1);
}


export function getCurrentMonthLastDate(): Date{
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth() + 1, 0,23,59,59,999);
}

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
  let currentDate = new Date(start);
  
  // Loop through each day in the range
  while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dateArray;
}


export function getFirstDate(year: number, month: number): Date{
  return new Date(year, month, 1);
}


export function getLastDate(year: number, month: number): Date{
  return new Date(year,month + 1, 0, 23, 59, 59, 999);
}

/**
 * Get local date string to display in client browser.
 */
export function getLocalDateString(){
  const now = new Date();//this is local time
  // Adjust for timezone offset (critical step!)
  const timezoneOffset = now.getTimezoneOffset() * 60000; // Convert minutes to ms
  const localISOFormatDate = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
  return localISOFormatDate;
}


/**
 * Convert local date string to UTC date in ISO format
 * @param dateString date value in local timezone
 * @returns UTC date value in ISO format
 */
export function getUTCISODateString(dateString: string):string{
  //c.d(dateString);
  const now = new Date(dateString);
  //c.d(now.toISOString().slice(0,10));
  return now.toISOString();
}


/**
 * Convert local date string to UTC date in ISO format
 * @param dateString date value in local timezone
 * @returns UTC date value in ISO format
 */
export function getUTCISODateTimeString(dateTimeString: string):string{c.i('xxx')
  c.d(dateTimeString);
  const now = new Date(dateTimeString);
  c.d(now.toISOString());
  return now.toISOString();
}


/**
 * Get local datetime string to display in client browser.
 */
export function getLocalDateTimeString(){
  const now = new Date();//this is local time
  // Adjust for timezone offset (critical step!), wihtout adjustment , toISOString will output UTC/GMT datetime
  const timezoneOffset = now.getTimezoneOffset() * 60000; // Convert minutes to ms
  const localISOFormatDateTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
  return localISOFormatDateTime;
}


/**
 * Build pagination PagerParams with default fields if fields are invalid.
 * @param inputObject - Any Object
 * @returns Original object with pager fields default.
 */
export function pagerWithDefaults(inputObject : PagerParams) : PagerParams {
  return {
    ...inputObject,
    orderBy : inputObject.orderBy ?? 'id',
    orderDirection : inputObject.orderDirection ?? 'asc',
    pageIndex : inputObject.pageIndex ?? 1,
    pageSize : inputObject.pageSize ?? 10
  }
}