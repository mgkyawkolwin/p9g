
export default class RoomReservationDto{
    public roomNo: string = '';
    public roomTypeText:string = '';
    public reservationId: string = '';
    public checkInDate: Date = null;
    public checkOutDate: Date = null;
    public noOfDays: number = 0;
    public noOfGuests: number = 0;
}