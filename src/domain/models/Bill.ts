export default class Bill{
    public id!: string;
    public dateUTC: string | undefined;
    public reservationId!: string;
    public purchaseDateUTC!: string;
    public itemName: string = "";
    public quantity: number = 0;
    public unitPrice: number = 0;
    public amount : number = 0;
    public isPaid: boolean = false;
    public paidOnUTC: string | undefined;
    public currency: string = "KWR";
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}