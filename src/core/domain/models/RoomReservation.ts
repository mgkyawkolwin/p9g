import ModelBase from "./ModelBase";
import RoomCharge from "./RoomCharge";
import { v4 as uuidv4 } from 'uuid';

export default class RoomReservation extends ModelBase{
    public id: string = uuidv4();
    public roomId!: string;
    public roomNo!: string;
    public roomType!:string;
    public roomTypeId!: string;
    public reservationId!: string;
    public checkInDate!: Date;
    public checkOutDate!: Date;
    public noOfExtraBed: number = 0;
    public isSingleOccupancy: boolean = false;
    public roomCharges: RoomCharge[] = [];
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}