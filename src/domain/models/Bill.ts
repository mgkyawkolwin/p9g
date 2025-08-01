export default class Bill{
    public id!: string;
    public dateUTC: Date = new Date();
    public reservationId!: string;
    public itemName: string = "";
    public quantity: number = 0;
    public unitPrice: number = 0;
    public amount : number = 0;
    public isPaid: boolean = false;
    public paidOnUTC: Date | undefined;
    public paymentType: string = "OTHER";
    public paymentMode: string = "CASH";
    public currency: string = "KWR";
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}