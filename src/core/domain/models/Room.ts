import RoomReservation from "./RoomReservation";
import Reservation from "./Reservation";
import DomainBase from "./DomainBase";

export default class Room extends DomainBase{
    public roomNo: string = '';
    public roomTypeId: string = '';
    public roomType: string = '';
    public reservations: Reservation[] = [];
    public roomReservations:RoomReservation[] = [];
}