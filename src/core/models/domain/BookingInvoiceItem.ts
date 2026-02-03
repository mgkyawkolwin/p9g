import DomainBase from "@/lib/models/domain/DomainBase";

export default class BookingInvoiceItem extends DomainBase {
    public description: string = '';
    public location: string = '';
    public startDate: Date = null;
    public endDate: Date = null;
    public pax: number = 0;
    public rate: number = 0;
    public amount: number = 0;
    public noOfRooms: number = 0;
    public noOfDays: number = 0;
}
