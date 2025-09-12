import EntityBase from "./EntityBase";

export default class RoomChargeEntity extends EntityBase{
    public reservationId: string = '';
    public startDate:Date = null;
    public endDate:Date = null;
    public roomId:string = '';
    public roomTypeId:string = '';
    public roomRate: string = '';
    public totalRate:string = '';
    public singleRate:string = '';
    public extraBedRate:string = '';
    public seasonSurcharge:string = '';
    public roomSurcharge:string = '';
    public noOfDays:number = 0;
    public totalAmount:string = '';
}