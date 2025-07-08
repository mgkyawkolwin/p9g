import { PagerParams, SearchParam } from "@/lib/types";
import IBaseService from "./IBaseService";
import Reservation from "@/domain/models/Reservation";

export default interface IReservationService {
    createReservation(reservation : Reservation): Promise<Reservation> ;
    patch(id:string, operation : string): Promise<void>;
    reservationFindById(id:string): Promise<Reservation|undefined>;
    reservationFindMany(searchParams: SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    updateReservation(id: string, reservation: Reservation) : Promise<Reservation>;
}