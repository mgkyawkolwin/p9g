//ordered import
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SearchParam, PagerParams } from "./types"

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
export function buildSearchParams(queryStringObject : any) : SearchParam[] {
  const search : SearchParam[]= [];
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
  if(queryStringObject.userName){
    search.push({searchColumn:'userName', searchValue: queryStringObject.UserName});
  }
  if(queryStringObject.email){
    search.push({searchColumn:'email', searchValue: queryStringObject.email});
  }
  return search
}


/**
 * Build query string from object, filter out invalid values (undefined, null, empty string)
 * @param {object} input - Any object with property.
 * @returns {string} Query string.
 */
export function buildQueryString(input:any): string{
  const queryString = new URLSearchParams(
    Object.entries(input)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();
  return queryString;
}


/**
 * Build pagination PagerParams with default fields if fields are invalid.
 * @param inputObject - Any Object
 * @returns Original object with pager fields default.
 */
export function pagerWithDefaults(inputObject : any) : PagerParams {
  return {
    ...inputObject,
    orderBy : inputObject.orderBy ?? 'id',
    orderDirection : inputObject.orderDirection ?? 'asc',
    pageIndex : inputObject.pageIndex ?? 1,
    pageSize : inputObject.pageSize ?? 10
  }
}