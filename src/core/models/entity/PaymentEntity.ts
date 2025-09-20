import EntityBase from "../../../lib/models/entity/EntityBase";

export default class PaymentEntity extends EntityBase{
    public paymentDateUTC:Date = new Date();
    public reservationId: string = '';
    public description:string = "";
    public amount:number = 0;
    public amountInCurrency:number = 0;
    public currency:string = 'KWR';
    public paymentMode:string = 'CASH';
    public paymentType: string = "NORMAL";
    public remark: string = "";
}