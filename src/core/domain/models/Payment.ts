import DomainBase from "./DomainBase";

export default class Payment extends DomainBase{
    public reservationId:string = '';
    public paymentDateUTC:Date = new Date();
    public description:string = "";
    public amount:number = 0;
    public amountInCurrency:number = 0;
    public currency:string = 'KWR';
    public paymentMode:string = 'CASH';
    public paymentType: string = "NORMAL";
    public remark: string = "";
}