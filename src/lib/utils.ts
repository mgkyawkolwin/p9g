import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { SearchParam, PagerParams, SearchFormFields } from "./types";
import { CustomError } from "./errors";




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

/**
 * Build SearchParam array from the querystring, which will be used in repository filtering.
 * Query string field should be start with search (e.g. searchName) to be distinguished from
 * entity values. Only known list will be converted into SearchParam.
 * 
 * Note: Intendted to be used in API route.
 * @param {Object} queryStringObject - Query string object with key/value.
 * @returns {SearchParam[]} - Array of SearchParam.
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


export function getCheckInDate(arrivalDate: Date){
  const checkInDate = new Date(arrivalDate);
  checkInDate.setUTCHours(0,0,0,0);
  if(arrivalDate.getUTCHours() >= 0 && arrivalDate.getUTCHours() <= 5){
    return checkInDate;
  }else{
    checkInDate.setUTCDate(checkInDate.getUTCDate() + 1);
    return checkInDate;
  }
}


export function getCheckOutDate(departureDate: Date){
  const checkOutDate = new Date(departureDate);
  checkOutDate.setUTCHours(0,0,0,0);
  if(departureDate.getUTCHours() >= 0 && departureDate.getUTCHours() <= 5){
    checkOutDate.setUTCDate(checkOutDate.getUTCDate() - 1);
    return checkOutDate;
  }else{
    return checkOutDate;
  }
}


export function getCurrentMonthFirstDate(): Date{
  const today = new Date();
  return new Date(today.getUTCFullYear(), today.getUTCMonth(), 1);
}


export function getCurrentMonthLastDate(): Date{
  const today = new Date();
  return new Date(today.getUTCFullYear(), today.getUTCMonth() + 1, 0,23,59,59,999);
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
  const currentDate = new Date(start);
  
  // Loop through each day in the range
  while (currentDate <= end) {
      dateArray.push(new Date(currentDate));
      currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }
  
  return dateArray;
}


export function getFirstDate(year: number, month: number): Date{
  return new Date(year, month, 1);
}

// export function getFakeLocalDateTimeFromUTCDateTime(date:Date):Date{
//   const fakeLocalDate = new Date(date.toISOString().replace('T',' ').slice(0,16));
//   return fakeLocalDate;
// }


export function getLastDate(year: number, month: number): Date{
  return new Date(year,month + 1, 0, 23, 59, 59, 999);
}

// export function getUTCDateFromFakeLocalDate(date:Date):Date{
//   return new Date(date.toLocaleString('sv-SE').slice(0,10) + 'T00:00:00.000Z');
// }

// export function getUTCDateTimeFromFakeLocalDateTime(date:Date):Date{
//   return new Date(date.toLocaleString('sv-SE').replace(' ','T') + '.000Z');
// }

export function getUTCDateMidNight(date:Date){
  const midNightDate = new Date(date);
  midNightDate.setUTCHours(23,59,59,999);
  return midNightDate;
}


export function getUTCDateTimeString(dateString:string){
  return `${dateString}T00:00:00.000Z`;
}


export function getUTCDateTimeMidNightString(dateString:string){
  return `${dateString}T23:59:59.999Z`;
}
/**
 * Get local date string to display in client browser.
 */
// export function getLocalDateString(){
//   const now = new Date();//this is local time
//   // Adjust for timezone offset (critical step!)
//   const timezoneOffset = now.getTimezoneOffset() * 60000; // Convert minutes to ms
//   const localISOFormatDate = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
//   return localISOFormatDate;
// }


/**
 * Convert local date string to UTC date in ISO format
 * @param dateString date value in local timezone
 * @returns UTC date value in ISO format
 */
// export function getUTCISODateString(dateString: string):string{
//   //c.d(dateString);
//   const now = new Date(dateString);
//   //c.d(now.toISOString().slice(0,10));
//   return now.toISOString();
// }


/**
 * Convert local date string to UTC date in ISO format
 * @param dateString date value in local timezone
 * @returns UTC date value in ISO format
 */
// export function getUTCISODateTimeString(dateTimeString: string):string{c.i('xxx')
//   c.d(dateTimeString);
//   const now = new Date(dateTimeString);
//   c.d(now.toISOString());
//   return now.toISOString();
// }


/**
 * Get local datetime string to display in client browser.
 */
// export function getLocalDateTimeString(){
//   const now = new Date();//this is local time
//   // Adjust for timezone offset (critical step!), wihtout adjustment , toISOString will output UTC/GMT datetime
//   const timezoneOffset = now.getTimezoneOffset() * 60000; // Convert minutes to ms
//   const localISOFormatDateTime = new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 16);
//   return localISOFormatDateTime;
// }


/**
 * Build pagination PagerParams with default fields if fields are invalid.
 * @param inputObject - Any Object
 * @returns Original object with pager fields default.
 */
export function getPagerWithDefaults(inputObject : PagerParams) : PagerParams {
  return {
    ...inputObject,
    orderBy : inputObject.orderBy ?? 'id',
    orderDirection : inputObject.orderDirection ?? 'asc',
    pageIndex : inputObject.pageIndex ?? 1,
    pageSize : inputObject.pageSize ?? 10
  }
}


export function getReservationStatusColorClass(status:string){
  if(status === 'NEW')
    return `text-[#333333] dark:text-[#dddddd]`;
  else if(status === 'CIN')
    return `text-[#008800] dark:text-[#00ff00]`;
  else if(status === 'OUT')
    return `text-[#888888] dark:text-[#888888]`;
  else if(status === 'CCL')
    return `text-[#cc0000] dark:text-[#ff0000]`;
}