import DomainBase from "@/lib/models/domain/DomainBase";

export default class PrepaidPackagePayment extends DomainBase {
    public prepaidPackageId: string = '';
    public amount: number = 0;
    public paymentDateTimeUTC: Date = new Date();
    public currency: string = 'KWR';
    public paymentMode: string = 'CASH';
    public remark: string = '';
}