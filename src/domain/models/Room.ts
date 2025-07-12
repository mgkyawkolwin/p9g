import RoomReservation from "../dtos/roomreservation";
import Reservation from "./Reservation";

export default class Room {
    public id!: string;
    public roomNo!: string;
    public roomTypeId!: string;
    public roomType!: string;
    public reservations: Reservation[] = [];
    public roomReservations:RoomReservation[] = [];
}