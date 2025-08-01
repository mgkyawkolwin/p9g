export default class Payment{
    public id:string | undefined;
    public reservationId!:string;
    public paymentDateUTC:Date = new Date();
    public description:string = "";
    public amount:number = 0;
    public amountInCurrency:number = 0;
    public currency:string = 'KWR';
    public paymentMode:string = 'CASH';
    public paymentType: string = "NORMAL";
    public remark: string = "";
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}