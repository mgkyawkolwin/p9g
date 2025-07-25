import { calculateDayDifference } from "@/lib/utils";
import RoomReservation from "../dtos/RoomReservation";
import Reservation from "../models/Reservation";
import RoomCharge from "../models/RoomCharge";
import RoomRate from "../models/RoomRate";
import RoomType from "../models/RoomType";
import { CustomError } from "@/lib/errors";

export interface MonthDetail {
    month: number;          // 0-11 (0 = January)
    year: number;           // Full year (e.g., 2025)
    noOfDays: number;       // Number of days in this month segment
    monthName: string;      // Full month name
    periodStart: Date;      // Actual start date for this month segment
    periodEnd: Date;        // Actual end date for this month segment
}

export default class RoomRateEngine{

    public static calculate(reservation: Reservation, roomReservations: RoomReservation[], roomTypes: RoomType[], roomRates: RoomRate[]) : RoomCharge[]{
        if(!reservation)
            throw new CustomError('Reservation in invalid.');
        if(!roomReservations || roomReservations.length == 0)
            throw new CustomError('Room Charge Calculation: room reservation list is empty.');
        if(!roomTypes || roomTypes.length === 0)
            throw new CustomError('Room Charge Calculation: room type list is empty');
        if(!roomRates || roomRates.length === 0)
            throw new CustomError('Room Charge Calculation: room rate list is empty.');

        const roomCharges : RoomCharge[] = [];

        //sort room reservation by check in date
        roomReservations.sort((a,b) => a.checkInDateUTC.getTime() - b.checkInDateUTC.getTime());
        roomRates.sort((a,b) => a.month - b.month);

        roomReservations.forEach(rr => {
            const monthDays = this.getMonthlyDateSegments(rr.checkInDateUTC, rr.checkOutDateUTC);
            let prvRoomCharge : RoomCharge;

            monthDays.forEach(md => {
                const rate = roomRates.find(rate => rate.month == md.month && rate.roomTypeId == rr.roomTypeId);
                if(!rate) throw new CustomError('Cannot find room rate');
                const roomCharge = new RoomCharge();
                roomCharge.reservationId = reservation.id;
                roomCharge.roomTypeId = rr.roomTypeId;
                roomCharge.roomId = rr.roomId;
                roomCharge.startDateUTC = md.periodStart;
                roomCharge.endDateUTC = md.periodEnd;
                roomCharge.seasonSurcharge = reservation.prepaidPackageId ? Number(rate.seasonSurcharge) : 0;
                roomCharge.roomSurcharge = reservation.prepaidPackageId ? Number(rate.roomSurcharge) : 0;
                roomCharge.noOfDays = Number(md.noOfDays);
                if(rr.isSingleOccupancy){
                    roomCharge.singleRate = Number(rate.singleRate);
                }

                //do not charge base room rate for prepaid packages
                if(reservation.prepaidPackageId && reservation.prepaidPackageId.trim() !== ''){
                    roomCharge.roomRate = 0;
                    roomCharge.totalRate = Number(roomCharge.roomSurcharge) + Number(roomCharge.seasonSurcharge )+ Number(roomCharge.singleRate);
                }else{
                    roomCharge.roomRate = Number(rate.roomRate);
                    roomCharge.totalRate = Number(roomCharge.roomRate) + Number(roomCharge.singleRate);
                }
                
                roomCharge.totalAmount = roomCharge.totalRate * roomCharge.noOfDays;
                if(prvRoomCharge && prvRoomCharge.totalRate == roomCharge.totalRate){
                    prvRoomCharge.noOfDays = Number(prvRoomCharge.noOfDays) + Number(roomCharge.noOfDays);
                    prvRoomCharge.endDateUTC = roomCharge.endDateUTC;
                    prvRoomCharge.totalAmount = (prvRoomCharge.totalRate * prvRoomCharge.noOfDays) + (prvRoomCharge.singleRate * prvRoomCharge.noOfDays);
                }else{
                    prvRoomCharge = roomCharge;
                    roomCharges.push(roomCharge);
                }
            });
        });

        return roomCharges;
    }


    static getMonthlyDateSegments(startDate: Date, endDate: Date): MonthDetail[] {
        if (startDate > endDate) {
            throw new Error("Start date must be before or equal to end date");
        }
    
        const result: MonthDetail[] = [];
        const monthNames = ["January", "February", "March", "April", "May", "June", 
                           "July", "August", "September", "October", "November", "December"];
    
        let currentDate = new Date(startDate);
        const lastDate = new Date(endDate);
    
        while (currentDate <= lastDate) {
            const currentMonth = currentDate.getMonth();
            const currentYear = currentDate.getFullYear();
            
            // Calculate month boundaries
            const monthStart = new Date(currentDate);
            monthStart.setDate(1);
            const monthEnd = new Date(currentDate);
            monthEnd.setMonth(monthEnd.getMonth() + 1);
            monthEnd.setDate(0);
            
            // Determine actual period start/end for this segment
            const periodStart = currentDate > monthStart ? new Date(currentDate) : new Date(monthStart);
            const periodEnd = lastDate < monthEnd ? new Date(lastDate) : new Date(monthEnd);
            
            // Calculate days in this segment (+1 because both dates are inclusive)
            const timeDiff = periodEnd.getTime() - periodStart.getTime();
            const daysInSegment = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;
    
            result.push({
                month: currentMonth,
                year: currentYear,
                noOfDays: daysInSegment,
                monthName: monthNames[currentMonth],
                periodStart: new Date(periodStart),
                periodEnd: new Date(periodEnd)
            });
    
            // Move to first day of next month
            currentDate = new Date(currentYear, currentMonth + 1, 1);
        }
    
        return result;
    }
}