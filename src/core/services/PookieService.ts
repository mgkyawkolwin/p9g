import { inject, injectable } from "inversify";
import { TYPES } from "@/core/types";
import LogError from "../models/domain/LogError";
import type IRepository from "@/lib/repositories/IRepository";
import PookieTimeTable from "../models/domain/PookieTimeTable";
import { and, asc, eq, gte, isNotNull, isNull, ne, or } from "@/lib/transformers/types";
import IPookieService from "./contracts/IPookieService";
import SessionUser from "../models/dto/SessionUser";
import c from "@/lib/loggers/console/ConsoleLogger";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import { TransactionType } from "../db/mysql/MySqlDatabase";
import { pookieTable } from "../orms/drizzle/mysql/schema";
import { eq as deq, and as dand, lt as dlt, lte as dlte } from "drizzle-orm";
import PookieTimeTableEntity from "../models/entity/PookieTimeTableEntity";
import { CustomError } from "@/lib/errors";
import { HttpStatusCode } from "../constants";
import Room from "../models/domain/Room";

@injectable()
export default class PookieService implements IPookieService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IPookieRepository) private pookieRepository: IRepository<PookieTimeTable>,
        @inject(TYPES.IRoomRepository) private roomRepository: IRepository<Room>) {

    }


    async draw(date: Date, rooms: string, noOfPeople: number, sessionUser: SessionUser): Promise<PookieTimeTable> {
        c.fs('PookieService > draw');
        c.d(date);
        c.d(rooms);

        const result: PookieTimeTable = await this.dbClient.db.transaction(async (tx: TransactionType) => {
            const timeTable : PookieTimeTableEntity[] = await tx.select().from(pookieTable)
                .where(
                    dand(
                        deq(pookieTable.date, date),
                        deq(pookieTable.isBusy, false),
                        dlte(pookieTable.noOfPeople, (4 - noOfPeople)),
                        deq(pookieTable.location, sessionUser.location)
                    )
                ).for('update');
            c.d(timeTable?.length);

            if(!timeTable || timeTable?.length <= 0)
                throw new CustomError('There is no avilable time slot to draw.', HttpStatusCode.NotFound);

            const randomIndex = Math.floor(Math.random() * timeTable.length);
            const selectedRow = timeTable[randomIndex];
            if(!selectedRow)
                throw new CustomError('Cannot find time slot to draw.', HttpStatusCode.NotFound);
            
            selectedRow.rooms = rooms.split(",").concat(selectedRow.rooms.split(",")).join();
            selectedRow.noOfPeople = Number(selectedRow.noOfPeople) + Number(noOfPeople);
            selectedRow.updatedAtUTC = new Date();
            selectedRow.updatedBy = sessionUser.id;

            await tx.update(pookieTable).set(selectedRow)
                .where(deq(pookieTable.id, selectedRow.id));

            return selectedRow;
        });
        c.fe('PookieService > draw');
        return result;
    }


    async generateTimeTable(date: Date, start: Date, end: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]> {
        c.fs('PookieService > generateTimeTable');

        const existing = await this.pookieRepository.findOne(eq("date", date.toISOString()));
        if(existing) throw new CustomError("Existing timetable, cannot regenerate.");

        const timeTable: PookieTimeTable[] = [];
        const currentTime = new Date(start);
        while (currentTime <= end) {
            const h1 = new PookieTimeTable();
            h1.date = date;
            h1.time = new Date(currentTime);
            h1.hole = `1`;
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
            h5.hole = `5`;
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
            h10.hole = `10`;
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
            h15.hole = `15`;
            h15.isBusy = false;
            h15.location = sessionUser.location;
            h15.createdAtUTC = new Date();
            h15.createdBy = sessionUser.id;
            h15.updatedAtUTC = new Date();
            h15.updatedBy = sessionUser.id;
            timeTable.push(h15);

            currentTime.setMinutes(currentTime.getMinutes() + 7);
        }

        if (timeTable.length > 0) {
            await this.pookieRepository.createMany(timeTable);
        }

        c.fe('PookieService > generateTimeTable');
        return timeTable;
    }


    async getRoomNames(date: Date, sessionUser: SessionUser): Promise<string[]>{
        c.fs('PookieService > getRoomNames');
        const [rooms, count] = await this.roomRepository.findMany(eq("location", sessionUser.location));

        const [drewResults, _] = await this.pookieRepository.findMany(
            and(
                eq("location", sessionUser.location),
                eq('date', date.toISOString())
            )
        );
        c.d("DREW RESULT")
        c.d(drewResults);
        const filteredRooms = rooms.filter(r =>
            !drewResults.some(dr => dr.rooms.includes(r.roomNo))
        );
        c.fe('PookieService > getRoomNames');
        return filteredRooms.map(r => r.roomNo);
    }
    

    async getTimeTable(date: Date, sessionUser: SessionUser): Promise<PookieTimeTable[]> {
        c.fs('PookieService > getTimeTable');
        const [table, count] = await this.pookieRepository.findMany(
            and(
                eq("date", date.toISOString()),
                eq("location", sessionUser.location)
            ), asc("date"));
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