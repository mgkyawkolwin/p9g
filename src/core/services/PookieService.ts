import { inject, injectable } from "inversify";
import { TYPES } from "@/core/types";
import LogError from "../models/domain/LogError";
import type IRepository from "@/lib/repositories/IRepository";
import PookieTimeTable from "../models/domain/PookieTimeTable";
import { asc, eq, gte } from "@/lib/transformers/types";
import IPookieService from "./contracts/IPookieService";
import SessionUser from "../models/dto/SessionUser";
import c from "@/lib/loggers/console/ConsoleLogger";

@injectable()
export default class PookieService implements IPookieService {

    constructor(@inject(TYPES.IPookieRepository) private pookieRepository: IRepository<PookieTimeTable>) {

    }

    async generateTimeTable(date: Date, start: Date, end: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]> {
        c.fs('PookieService > generateTimeTable');
        const timeTable: PookieTimeTable[] = [];
        const currentTime = new Date(start);
        while (currentTime <= end) {
            const h1 = new PookieTimeTable();
            h1.date = date;
            h1.time = new Date(currentTime);
            h1.hole = `Hole 1`;
            h1.isBusy = false;
            h1.location = sessionUser.location;
            h1.createdAtUTC = new Date();
            h1.createdBy = sessionUser.id;
            h1.updatedAtUTC = new Date();
            h1.updatedBy = sessionUser.id;
            timeTable.push(h1);

            const h5 = new PookieTimeTable();
            h5.date = date;
            h5.time = new Date(currentTime);
            h5.hole = `Hole 5`;
            h5.isBusy = false;
            h5.location = sessionUser.location;
            h5.createdAtUTC = new Date();
            h5.createdBy = sessionUser.id;
            h5.updatedAtUTC = new Date();
            h5.updatedBy = sessionUser.id;
            timeTable.push(h5);

            const h10 = new PookieTimeTable();
            h10.date = date;
            h10.time = new Date(currentTime);
            h10.hole = `Hole 10`;
            h10.isBusy = false;
            h10.location = sessionUser.location;
            h10.createdAtUTC = new Date();
            h10.createdBy = sessionUser.id;
            h10.updatedAtUTC = new Date();
            h10.updatedBy = sessionUser.id;
            timeTable.push(h10);

            const h15 = new PookieTimeTable();
            h15.date = date;
            h15.time = new Date(currentTime);
            h15.hole = `Hole 15`;
            h15.isBusy = false;
            h15.location = sessionUser.location;
            h15.createdAtUTC = new Date();
            h15.createdBy = sessionUser.id;
            h15.updatedAtUTC = new Date();
            h15.updatedBy = sessionUser.id;
            timeTable.push(h15);

            currentTime.setMinutes(currentTime.getMinutes() + 7);
        }

        if(timeTable.length > 0){
            await this.pookieRepository.createMany(timeTable);
        }

        c.fe('PookieService > generateTimeTable');
        return timeTable;
    }

    async getTimeTable(date: Date): Promise<PookieTimeTable[]> {
        c.fs('PookieService > getTimeTable');
        const [table, count] = await this.pookieRepository.findMany(eq("date", date.toISOString()), asc("date"));
        c.d(count);
        c.d(count > 0 ? table[0] : []);
        c.fe('PookieService > getTimeTable');
        return table;
    }


    async updatePookie(pookie: PookieTimeTable, sessionUser: SessionUser): Promise<void> {
        c.fs('PookieService > updatePookie');
        pookie.updatedAtUTC = new Date();
        pookie.updatedBy = sessionUser.id;
        await this.pookieRepository.update(pookie.id, pookie);
        c.fe('PookieService > updatePookie');
    }


}