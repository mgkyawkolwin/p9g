export default class RoomReservation{
    public id!: string;
    public roomId!: string;
    public reservationId!: string;
    public checkInDateUTC: string | undefined;
    public checkOutDateUTC: string | undefined;
    public noOfExtraBed: number = 0;
    public createdAtUTC!: Date;
    public createdBy!: string;
    public updatedAtUTC!: Date;
    public updatedBy!: string;
}