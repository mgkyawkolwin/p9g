import DomainBase from "@/lib/models/domain/DomainBase";

export default class RoomCharge extends DomainBase{
    public reservationId: string = '';
    public startDate:Date = null;
    public endDate:Date = null;
    public roomId:string = '';
    public roomNo:string = '';
    public roomTypeId:string = '';
    public roomType:string = '';
    public roomTypeText:string = '';
    public roomRate: number = 0;
    public totalRate:number = 0;
    public singleRate:number = 0;
    public extraBedRate:number = 0;
    public seasonSurcharge:number = 0;
    public roomSurcharge:number=0;
    public noOfDays:number = 0;
    public totalAmount:number = 0;
}