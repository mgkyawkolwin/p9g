//ordered import
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { SearchParam, PagerParams } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function buildSearchParams(pagerParams : any) : SearchParam[] {
  const search : SearchParam[]= [];
  if(pagerParams.userName){
    search.push({searchColumn:'userName', searchValue: pagerParams.UserName});
  }
  if(pagerParams.email){
    search.push({searchColumn:'email', searchValue: pagerParams.email});
  }
  return search
}

export function buildTableQueryString(input:any): string{
  const queryString = new URLSearchParams(
    Object.entries(input)
      .filter(([_, value]) => value !== undefined && value !== null && value !== '')
      .map(([key, value]) => [key, String(value)])
  ).toString();
  return queryString;
}

export function pagerWithDefaults(searchParams : any) : PagerParams {
  return {
    ...searchParams,
    orderBy : searchParams.orderBy ?? 'id',
    orderDirection : searchParams.orderDirection ?? 'asc',
    pageIndex : searchParams.pageIndex ?? 1,
    pageSize : searchParams.pageSize ?? 10
  }
}