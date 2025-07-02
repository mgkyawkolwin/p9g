import { Reservation } from "../orm/drizzle/mysql/schema";
import IRepository from "./IRepository";

export default interface IReservationRepository extends IRepository<Reservation>{
    
}