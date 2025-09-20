import EntityBase from '../../../lib/models/entity/EntityBase';

export default class RoomReservationEntity extends EntityBase{
    public roomId: string = '';
    public roomNo: string = '';
    public roomType:string = '';
    public roomTypeId: string = '';
    public reservationId: string = '';
    public checkInDate: Date = null;
    public checkOutDate: Date = null;
    public noOfExtraBed: number = 0;
    public isSingleOccupancy: boolean = false;
}