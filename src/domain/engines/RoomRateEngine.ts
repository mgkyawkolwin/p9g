import { calculateDayDifference } from "@/lib/utils";
import RoomReservation from "../dtos/RoomReservation";
import Reservation from "../models/Reservation";
import RoomCharge from "../models/RoomCharge";
import RoomSeasonRate from "../models/RoomSeasonRate";
import RoomType from "../models/RoomType";

export default class RoomRateEngine{

    public calculate(reservation: Reservation, roomReservations: RoomReservation[], roomTypes: RoomType[], seasonRates: RoomSeasonRate[]) : RoomCharge[]{
        const roomCharges : RoomCharge[] = [];
        let startDate = reservation.checkInDateUTC;
        let endDate = reservation.checkOutDateUTC;

        //sort room reservation by check in date
        roomReservations.sort((a,b) => a.checkInDateUTC.getTime() - b.checkInDateUTC.getTime());
        seasonRates.sort((a,b) => a.startDateUTC.getTime() - b.startDateUTC.getTime());

        roomReservations.forEach(rr => {
            //update start date as room reservation start date
            startDate = rr.checkInDateUTC;
            seasonRates.forEach(sr => {
                if(startDate >= sr.startDateUTC && startDate < sr.endDateUTC){
                    const roomCharge  = new RoomCharge();
                    roomCharge.startDateUTC = rr.checkInDateUTC;
                    if(rr.checkOutDateUTC <= sr.endDateUTC){
                        roomCharge.endDateUTC = rr.checkOutDateUTC;
                    }else{
                        roomCharge.endDateUTC = sr.endDateUTC;
                    }
                    startDate = new Date(roomCharge.endDateUTC);
                    startDate.setDate(startDate.getDate() + 1);
                    roomCharge.rate = sr.roomRate;
                    roomCharge.noOfDays = calculateDayDifference(roomCharge.startDateUTC, roomCharge.endDateUTC);
                    if(rr.isSingleOccupancy){
                        roomCharge.rate = roomCharge.rate + sr.singleRate;
                    }
                    roomCharge.total = roomCharge.rate * roomCharge.noOfDays;
                    roomCharges.push(roomCharge);
                }
            });

            //after applying season rate, start date will be updated accordingly
            if(startDate <= rr.checkOutDateUTC){
                const roomCharge = new RoomCharge();
                roomCharge.startDateUTC = startDate;
                roomCharge.endDateUTC = rr.checkOutDateUTC;
                roomCharge.noOfDays = calculateDayDifference(roomCharge.startDateUTC, roomCharge.endDateUTC);
                roomCharge.rate = roomTypes.find(rt => rt.id == rr.roomTypeId).roomRate;
                if(rr.isSingleOccupancy){
                    roomCharge.rate = roomCharge.rate + roomTypes.find(rt => rt.id == rr.roomTypeId).singleRate;
                }
                roomCharge.total = roomCharge.rate * roomCharge.noOfDays;
                roomCharges.push(roomCharge);
            }
        });

        return roomCharges;
    }
}