import { TYPES } from "@/core/types";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import { CustomError } from "@/lib/errors";
import c from "@/lib/loggers/console/ConsoleLogger";
import type IRepository from "@/lib/repositories/IRepository";
import { and, asc, eq, like } from "@/lib/transformers/types";
import { and as dand, eq as deq, lte as dlte } from "drizzle-orm";
import { inject, injectable } from "inversify";
import QRCode from "qrcode";
import { HttpStatusCode } from "../constants";
import { TransactionType } from "../db/mysql/MySqlDatabase";
import PookieConfig from "../models/domain/PookieConfig";
import PookieDevice from "../models/domain/PookieDevice";
import PookieTimeTable from "../models/domain/PookieTimeTable";
import Room from "../models/domain/Room";
import PookieInfo from "../models/dto/PookieInfo";
import RoomAndPax from "../models/dto/RoomAndPax";
import SessionUser from "../models/dto/SessionUser";
import PookieTimeTableEntity from "../models/entity/PookieTimeTableEntity";
import { pookieTable } from "../orms/drizzle/mysql/schema";
import type IReservationRepository from "../repositories/contracts/IReservationRepository";
import IPookieService from "./contracts/IPookieService";

@injectable()
export default class PookieService implements IPookieService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IPookieConfigRepository) private pookieConfigRepository: IRepository<PookieConfig>,
        @inject(TYPES.IPookieDeviceRepository) private pookieDeviceRepository: IRepository<PookieDevice>,
        @inject(TYPES.IPookieRepository) private pookieRepository: IRepository<PookieTimeTable>,
        @inject(TYPES.IReservationRepository) private reservationRepository: IReservationRepository,
        @inject(TYPES.IRoomRepository) private roomRepository: IRepository<Room>) {

    }


    async authenticateDevice(key: string, deviceId: string, sessionUser: SessionUser): Promise<boolean> {
        c.fs('PookieService > authenticateDevice');
        const qrConfig = await this.pookieConfigRepository.findOne(eq("key", key));
        c.d(qrConfig);
        if (!qrConfig) return false;

        // check whether the device is blocked.
        const [devices, _] = await this.pookieDeviceRepository.findMany(
            eq("deviceId", deviceId)
        );

        const blockedDevice = devices.find(d => d.isBlocked === true);

        if (blockedDevice) return false;

        if (devices?.length === 0) {
            const pookieDevice = new PookieDevice();
            pookieDevice.deviceId = deviceId;
            pookieDevice.isBlocked = false;
            pookieDevice.lastRequestAtUTC = new Date();
            pookieDevice.createdAtUTC = new Date();
            pookieDevice.createdBy = sessionUser.id;
            pookieDevice.updatedAtUTC = new Date();
            pookieDevice.updatedBy = sessionUser.id;

            await this.pookieDeviceRepository.create(pookieDevice);
        }

        c.fe('PookieService > authenticateDevice');
        return true;
    }


    async draw(date: Date, rooms: string, noOfPeople: number, sessionUser: SessionUser): Promise<PookieTimeTable> {
        c.fs('PookieService > draw');
        c.d(date);
        c.d(rooms);

        const result: PookieTimeTable = await this.dbClient.db.transaction(async (tx: TransactionType) => {
            const timeTable: PookieTimeTableEntity[] = await tx.select().from(pookieTable)
                .where(
                    dand(
                        deq(pookieTable.date, date),
                        deq(pookieTable.isBusy, false),
                        dlte(pookieTable.noOfPeople, (4 - noOfPeople)),
                        deq(pookieTable.location, sessionUser.location)
                    )
                ).for('update');
            c.d(timeTable?.length);

            if (!timeTable || timeTable?.length <= 0)
                throw new CustomError('There is no avilable time slot to draw.', HttpStatusCode.NotFound);

            const randomIndex = Math.floor(Math.random() * timeTable.length);
            const selectedRow = timeTable[randomIndex];
            if (!selectedRow)
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

        const existing = await this.pookieRepository.findOne(
            and(
                eq("date", date.toISOString()),
                eq("location", sessionUser.location)
            )
        );
        if (existing) throw new CustomError("Existing timetable, cannot regenerate.");

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


    async getQR(sessionUser: SessionUser): Promise<string> {
        c.fs('PookieService > getQR');
        const [qr, _] = await this.pookieConfigRepository.findMany();
        c.d(qr);

        c.fe('PookieService > getQR');
        return await QRCode.toDataURL(qr[0].key);
    }


    async getResult(date: Date, roomName: string, sessionUser: SessionUser): Promise<PookieTimeTable> {
        c.fs('PookieService > getResult');
        const result = await this.pookieRepository.findOne(
            and(
                eq("date", date.toISOString()),
                eq("location", sessionUser.location),
                like("rooms", roomName)
            ));
        c.fe('PookieService > getTimeTable');
        return result;
    }


    async getRoomNames(date: Date, list: string, sessionUser: SessionUser): Promise<string[]> {
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
        if(list === 'all') {
            return rooms.map(r => r.roomNo);
        }
        
        const filteredRooms = rooms.filter(r =>
            !drewResults.some(dr => dr.rooms.includes(r.roomNo))
        );
        c.fe('PookieService > getRoomNames');
        return filteredRooms.map(r => r.roomNo);
    }


    async getRoomsAndPax(date: Date, list: string, sessionUser: SessionUser): Promise<RoomAndPax[]> {
        c.fs('PookieService > getRoomsAndPax');
        
        const roomsAndPax = await this.reservationRepository.getRoomsAndPax(date, sessionUser);
        c.d(roomsAndPax?.length);

        if(list === 'all') {
            c.fe('PookieService > getRoomsAndPax');
            return roomsAndPax;
        }

        const [drewResults, _] = await this.pookieRepository.findMany(
            and(
                eq("location", sessionUser.location),
                eq('date', date.toISOString())
            )
        );
        c.d(drewResults?.length);
        const filteredRoomsAndPax = roomsAndPax.filter(r =>
            !drewResults.some(dr => dr.rooms.includes(r.roomNo))
        );
        c.d(filteredRoomsAndPax?.length);
        c.fe('PookieService > getRoomsAndPax');
        return filteredRoomsAndPax;
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


    async getPookieInfo(sessionUser: SessionUser): Promise<PookieInfo> {
        c.fs('PookieService > getVersion');
        const [qr, _] = await this.pookieConfigRepository.findMany();
        c.d(qr);
        const pookieInfo = new PookieInfo();
        pookieInfo.contactUrl = qr[0].contactUrl;
        pookieInfo.version = qr[0].version;

        c.fe('PookieService > getVersion');
        return pookieInfo;
    }


    async updatePookie(pookie: PookieTimeTable, sessionUser: SessionUser): Promise<void> {
        c.fs('PookieService > updatePookie');
        pookie.updatedAtUTC = new Date();
        pookie.updatedBy = sessionUser.id;
        await this.pookieRepository.update(pookie.id, pookie);
        c.fe('PookieService > updatePookie');
    }


}