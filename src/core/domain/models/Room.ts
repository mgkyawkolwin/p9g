import RoomReservation from "./RoomReservation";
import Reservation from "./Reservation";
import ModelBase from "./ModelBase";

export default class Room extends ModelBase{
    public roomNo: string = '';
    public roomTypeId: string = '';
    public roomType: string = '';
    public reservations: Reservation[] = [];
    public roomReservations:RoomReservation[] = [];
}