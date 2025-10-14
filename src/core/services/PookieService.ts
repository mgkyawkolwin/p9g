import { inject, injectable } from "inversify";
import { TYPES } from "@/core/types";
import LogError from "../models/domain/LogError";
import type IRepository from "@/lib/repositories/IRepository";
import PookieTimeTable from "../models/domain/PookieTimeTable";
import { eq } from "@/lib/transformers/types";

@injectable()
export default class PookieService {

    constructor(@inject(TYPES.IPookieRepository) private pookieRepository: IRepository<PookieTimeTable>) {

    }

    async timeTableGenerate(date: Date, start: Date, end: Date): Promise<PookieTimeTable[]> {
        const timeTable: PookieTimeTable[] = [];
        const currentTime = new Date(start);
        while (currentTime <= end) {
            const h1 = new PookieTimeTable();
            h1.date = date;
            h1.time = currentTime;
            h1.hole = `Hole 1`;
            h1.isBusy = false;
            timeTable.push(h1);

            const h5 = new PookieTimeTable();
            h5.date = date;
            h5.time = currentTime;
            h5.hole = `Hole 5`;
            h5.isBusy = false;
            timeTable.push(h5);

            const h10 = new PookieTimeTable();
            h10.date = date;
            h10.time = currentTime;
            h10.hole = `Hole 10`;
            h10.isBusy = false;
            timeTable.push(h10);

            const h15 = new PookieTimeTable();
            h15.date = date;
            h15.time = currentTime;
            h15.hole = `Hole 15`;
            h15.isBusy = false;
            timeTable.push(h15);
            currentTime.setMinutes(currentTime.getMinutes() + 7);
        }

        if(timeTable.length > 0){
            await this.pookieRepository.createMany(timeTable);
        }

        return timeTable;
    }

    async getTimeTable(date: Date): Promise<PookieTimeTable[]> {
        const [table, count] = await this.pookieRepository.findMany(eq("date", date));
        return table;
    }
}