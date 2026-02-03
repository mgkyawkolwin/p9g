import DomainBase from "@/lib/models/domain/DomainBase";

export default class SimpleInvoiceItem extends DomainBase {
    public description: string = '';
    public location: string = '';
    public amount: number = 0;
    public currency: string = 'KWR';
}
