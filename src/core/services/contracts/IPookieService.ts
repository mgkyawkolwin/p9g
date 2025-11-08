import PookieTimeTable from "@/core/models/domain/PookieTimeTable";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IPookieService {

    draw(date: Date, rooms: string, noOfPeople: number, sessionUser: SessionUser): Promise<PookieTimeTable>;
    generateTimeTable(date: Date, start: Date, end: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]>;
    getRoomNames(date: Date, sessionUser: SessionUser): Promise<string[]>;
    getTimeTable(date: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]> ;
    updatePookie(pookie: PookieTimeTable, sessionUser: SessionUser): Promise<void>;

}