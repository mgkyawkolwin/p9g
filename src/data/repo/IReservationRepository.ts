import { PagerParams, SearchParam } from "@/lib/types";
import { Reservation } from "../orm/drizzle/mysql/schema";
import IRepository from "./IRepository";

export default interface IReservationRepository extends IRepository<Reservation>{
    findReservations(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
    findReservationsX(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[Reservation[], PagerParams]>;
}