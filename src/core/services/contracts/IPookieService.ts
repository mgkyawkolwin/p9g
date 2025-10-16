import PookieTimeTable from "@/core/models/domain/PookieTimeTable";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IPookieService {

    generateTimeTable(date: Date, start: Date, end: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]>;
    getTimeTable(date: Date): Promise<PookieTimeTable[]> ;
    updatePookie(pookie: PookieTimeTable, sessionUser: SessionUser): Promise<void>;

}