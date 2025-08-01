export default class RoomCharge{
    public id!:string;
    public reservationId!: string;
    public startDateUTC!:Date;
    public endDateUTC!:Date;
    public roomId!:string;
    public roomNo!:string;
    public roomTypeId!:string;
    public roomType!:string;
    public roomTypeText!:string;
    public roomRate: number = 0;
    public totalRate:number = 0;
    public singleRate:number = 0;
    public extraBedRate:number = 0;
    public seasonSurcharge:number = 0;
    public roomSurcharge:number=0;
    public noOfDays:number = 0;
    public totalAmount:number = 0;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}