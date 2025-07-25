export default class RoomReservation{
    public id!: string;
    public roomId!: string;
    public roomNo!: string;
    public roomType!:string;
    public roomTypeId!: string;
    public reservationId!: string;
    public checkInDateUTC!: Date;
    public checkOutDateUTC!: Date;
    public noOfExtraBed: number = 0;
    public isSingleOccupancy: boolean;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}