import Customer from "../domain/Customer";

export default class RoomReservationDto{
    public roomNo: string = '';
    public roomTypeText:string = '';
    public reservationId: string = '';
    public checkInDate: string = '';
    public checkOutDate: string = '';
    public customers: Customer[] = [];
    public noOfDays: number = 0;
    public noOfGuests: number = 0;
    public golfCart?: string;
    public feedback?: string;
}