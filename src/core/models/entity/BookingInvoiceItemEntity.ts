import EntityBase from "@/lib/models/entity/EntityBase";

export default class BookingInvoiceItemEntity extends EntityBase {
    public invoiceId: string = '';
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
