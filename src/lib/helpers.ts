import { and, AnyCondition, eq, gte, like, lte, or } from "./transformers/types";
import { getUTCDateMidNight } from "./utils";

export function buildAnyCondition(queryObject: any): AnyCondition | null {
    if(!queryObject) return null;
    const conditions: AnyCondition[] = [];
    const queryStringObject = Object.fromEntries(
        Object.entries(queryObject).filter(([key, value]) => value !== 'DEFAULT' && value !== '')
    );
    if(!queryStringObject) return null;
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
        conditions.push(gte('createdAtUTC', queryStringObject.searchCreatedDateFrom));
    } else if (queryStringObject.searchCreatedDateFrom) {
        conditions.push(gte('createdAtUTC', queryStringObject.searchCreatedDateFrom));
    } else if (queryStringObject.searchCreatedDateUntil) {
        conditions.push(eq('createdAtUTC', queryStringObject.searchCreatedDateUntil));
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
        conditions.push(or(eq('name', queryStringObject.searchName), like('name', `${queryStringObject.searchName}`)));
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
    if(conditions.length === 0) return null;
    
    return conditions.length >1 ? and(...conditions) : conditions[0];
}