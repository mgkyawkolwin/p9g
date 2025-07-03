import { PagerParams } from "@/lib/types";
import IBaseService from "./IBaseService";
import Reservation from "@/domain/models/Reservation";

export default interface IReservationService {
    createReservation(reservation : Reservation): Promise<Reservation> ;
    reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    updateReservation(id: string, reservation: Reservation) : Promise<Reservation>;
}