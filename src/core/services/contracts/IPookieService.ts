import PookieTimeTable from "@/core/models/domain/PookieTimeTable";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IPookieService {

    authenticateDevice(qr: string, deviceId: string, sessionUser: SessionUser): Promise<boolean>;
    draw(date: Date, rooms: string, noOfPeople: number, sessionUser: SessionUser): Promise<PookieTimeTable>;
    generateTimeTable(date: Date, start: Date, end: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]>;
    getQR(sessionUser: SessionUser): Promise<string>;
    getRoomNames(date: Date, sessionUser: SessionUser): Promise<string[]>;
    getTimeTable(date: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]>;
    getVersion(sessionUser: SessionUser): Promise<string>;
    updatePookie(pookie: PookieTimeTable, sessionUser: SessionUser): Promise<void>;

}