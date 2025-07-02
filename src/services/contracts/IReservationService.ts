import { Reservation } from "@/data/orm/drizzle/mysql/schema";
import { PagerParams } from "@/lib/types";

export default interface IReservationService {
    reservationTopList(pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
}