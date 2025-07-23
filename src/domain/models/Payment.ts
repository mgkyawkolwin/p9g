export default class Payment{
    public id:string | undefined;
    public reservationId!:string;
    public paymentDateUTC!:Date;
    public description!:string;
    public amount:number = 0;
    public amountInCurrency:number = 0;
    public currency:string = 'KWR';
    public paymentMode:string;
    public remark: string | undefined;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}