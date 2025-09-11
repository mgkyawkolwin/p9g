import ModelBase from "./ModelBase";
import { v4 as uuidv4 } from 'uuid';

export default class RoomCharge extends ModelBase{
    public id:string = uuidv4();
    public reservationId: string = undefined;
    public startDate:Date = undefined;
    public endDate:Date = undefined;
    public roomId:string = undefined;
    public roomNo:string = undefined;
    public roomTypeId:string = undefined;
    public roomType:string = undefined;
    public roomTypeText:string = undefined;
    public roomRate: number = 0;
    public totalRate:number = 0;
    public singleRate:number = 0;
    public extraBedRate:number = 0;
    public seasonSurcharge:number = 0;
    public roomSurcharge:number=0;
    public noOfDays:number = 0;
    public totalAmount:number = 0;
    public createdAtUTC: Date = undefined;
    public createdBy: string = undefined;
    public updatedAtUTC: Date = undefined;
    public updatedBy: string = undefined;
}