
export default class RoomRate {
    public id!: string;
    public roomType!: string;
    public roomTypeId!: string;
    public roomRate!: number;
    public singleRate!: number;
    public seasonSurcharge!: number;
    public roomSurcharge!: number;
    public extraBedRate!: number;
    public location!: string;
    public month!: number;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC?: Date;
    public updatedBy?: string;
}