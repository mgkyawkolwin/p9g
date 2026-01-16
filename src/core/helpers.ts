import { and, AnyCondition, eq, gte, like, lte, or } from "../lib/transformers/types";
import { getUTCDateMidNight } from "../lib/utils";
import { PagerParams } from "./types";

export function buildAnyCondition(queryObject: any): AnyCondition | null {
    if (!queryObject) return null;
    const conditions: AnyCondition[] = [];
    const queryStringObject = Object.fromEntries(
        Object.entries(queryObject).filter(([key, value]) => value !== 'DEFAULT' && value !== '')
    );
    if (!queryStringObject) return null;
    if (queryStringObject.searchArrivalDateTime) {
        conditions.push(and(
            gte('arrivalDateTime', queryStringObject.searchArrivalDateTime),
            lte('arrivalDateTime', getUTCDateMidNight(queryStringObject.searchArrivalDateTime as Date))
        ));
    }
    if (queryStringObject.searchCheckInDate) {
        conditions.push(eq('checkInDate', queryStringObject.searchCheckInDate));
    }

    if (queryStringObject.searchCheckInDateFrom && queryStringObject.searchCheckInDateUntil) {
        conditions.push(and(gte('checkInDate', queryStringObject.searchCheckInDateFrom), eq('checkInDate', queryStringObject.searchCheckInDateUntil)));
    } else if (queryStringObject.searchCheckInDateFrom) {
        conditions.push(gte('checkInDate', queryStringObject.searchCheckInDateFrom));
    } else if (queryStringObject.searchCheckInDateUntil) {
        conditions.push(lte('checkInDate', queryStringObject.searchCheckInDateUntil));
    }
    if (queryStringObject.searchCheckOutDate) {
        conditions.push(eq('checkOutDate', queryStringObject.searchCheckOutDate));
    }
    if (queryStringObject.searchCreatedDateFrom && queryStringObject.searchCreatedDateUntil) {
        conditions.push(and(
            gte('createdAtUTC', queryStringObject.searchCreatedDateFrom),
            lte('createdAtUTC', queryStringObject.searchCreatedDateUntil)
        ));
    } else if (queryStringObject.searchCreatedDateFrom) {
        conditions.push(gte('createdAtUTC', queryStringObject.searchCreatedDateFrom));
    } else if (queryStringObject.searchCreatedDateUntil) {
        conditions.push(lte('createdAtUTC', queryStringObject.searchCreatedDateUntil));
    }
    if (queryStringObject.searchDate) {
        conditions.push(eq('date', queryStringObject.searchDate));
    }
    if (queryStringObject.searchDepartureDateTime) {
        conditions.push(and(
            gte('departureDateTime', queryStringObject.searchDepartureDateTime),
            lte('departureDateTime', getUTCDateMidNight(queryStringObject.searchDepartureDateTime as Date))
        ));
    }
    if (queryStringObject.searchId) {
        conditions.push(or(eq('id', queryStringObject.searchId), like('id', `%${queryStringObject.searchId}%`)));
    }
    if (queryStringObject.searchName) {
        conditions.push(
            or(
                eq('name', queryStringObject.searchName),
                like('name', `${queryStringObject.searchName}`),
                eq('englishName', queryStringObject.searchName),
                like('englishName', `${queryStringObject.searchName}`)
            ));
    }
    if (queryStringObject.searchNationalId) {
        conditions.push(or(eq('nationalId', queryStringObject.searchNationalId), like('nationalId', `%${queryStringObject.searchNationalId}%`)));
    }
    if (queryStringObject.searchPassport) {
        conditions.push(or(eq('passport', queryStringObject.searchPassport), like('passport', `%${queryStringObject.searchPassport}%`)));
    }
    if (queryStringObject.searchPhone) {
        conditions.push(or(eq('phone', queryStringObject.searchPhone), like('phone', `%${queryStringObject.searchPhone}%`)));
    }
    if (queryStringObject.searchPrepaidPackage) {
        conditions.push(eq('prepaidPackage', queryStringObject.searchPrepaidPackage));
    }
    if (queryStringObject.searchPromotionPackage) {
        conditions.push(eq('promotionPackage', queryStringObject.searchPromotionPackage));
    }
    if (queryStringObject.searchRemark) {
        conditions.push(or(eq('remark', queryStringObject.searchRemark), like('remark', `%${queryStringObject.searchRemark}%`)));
    }
    if (queryStringObject.searchReservationStatus) {
        conditions.push(eq('reservationStatus', queryStringObject.searchReservationStatus));
    }
    if (queryStringObject.searchReservationType) {
        conditions.push(eq('reservationType', queryStringObject.searchReservationType));
    }
    if (queryStringObject.searchUserName) {
        conditions.push(eq('userName', queryStringObject.searchUserName));
    }
    if (queryStringObject.searchEmail) {
        conditions.push(eq('email', queryStringObject.searchEmail));
    }
    if (conditions.length === 0) return null;

    return conditions.length > 1 ? and(...conditions) : conditions[0];
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
export function getPagerWithDefaults(inputObject: PagerParams): PagerParams {
    return {
        ...inputObject,
        orderBy: inputObject.orderBy ?? 'id',
        orderDirection: inputObject.orderDirection ?? 'asc',
        pageIndex: inputObject.pageIndex ?? 1,
        pageSize: inputObject.pageSize ?? 10
    };
} export function getReservationStatusColorClass(status: string) {
    if (status === 'NEW')
        return `text-[#333333] dark:text-[#dddddd]`;
    else if (status === 'CFM')
        return `text-[#0000ff] dark:text-[#6666ff]`;
    else if (status === 'CIN')
        return `text-[#008800] dark:text-[#00ff00]`;
    else if (status === 'OUT')
        return `text-[#888888] dark:text-[#888888]`;
    else if (status === 'CCL')
        return `text-[#cc0000] dark:text-[#ff0000]`;
}
/**
 * Get check-in date based on arrival date.
 * @param arrivalDate
 * @returns
 */

export function getUTCCheckInDate(arrivalDate: Date) {
    const checkInDate = new Date(arrivalDate);
    checkInDate.setUTCHours(0, 0, 0, 0);
    if (arrivalDate.getUTCHours() >= 0 && arrivalDate.getUTCHours() <= 5) {
        return checkInDate;
    } else {
        checkInDate.setUTCDate(checkInDate.getUTCDate() + 1);
        return checkInDate;
    }
}
/**
 * Get checkout date based on departure date.
 * @param departureDate
 * @returns
 */


export function getUTCCheckOutDate(departureDate: Date) {
    const checkOutDate = new Date(departureDate);
    checkOutDate.setUTCHours(0, 0, 0, 0);
    if (departureDate.getUTCHours() >= 0 && departureDate.getUTCHours() <= 11) {
        checkOutDate.setUTCDate(checkOutDate.getUTCDate() - 1);
        return checkOutDate;
    } else {
        return checkOutDate;
    }
}

