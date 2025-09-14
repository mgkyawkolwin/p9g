import DomainBase from "./DomainBase";
import RoomCharge from "./RoomCharge";
import { v4 as uuidv4 } from 'uuid';

export default class RoomReservation extends DomainBase{
    public roomId: string = '';
    public roomNo: string = '';
    public roomType:string = '';
    public roomTypeId: string = '';
    public reservationId: string = '';
    public checkInDate: Date = null;
    public checkOutDate: Date = null;
    public noOfExtraBed: number = 0;
    public isSingleOccupancy: boolean = false;
    public roomCharges: RoomCharge[] = [];
}