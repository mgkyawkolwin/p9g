import { inject, injectable } from 'inversify';

import { auth } from '@/app/auth';
import { TYPES } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import type IRepository from '@/lib/repositories/IRepository';
import type { IDatabaseClient } from '@/lib/db/IDatabase';
import type { PagerParams, SearchFormFields } from '@/core/types';
import ILogService from './contracts/ILogService';
import LogError from '../models/domain/LogError';
import { configTable, reservationLogTable, reservationTable, roomChargeLogTable, roomTable, roomTypeTable, userTable } from '@/core/orms/drizzle/mysql/schema';
import { count, desc, eq, gte, like, lte, or } from 'drizzle-orm';
import { alias } from 'drizzle-orm/mysql-core';

@injectable()
export default class LogService implements ILogService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.ILogRepository) private logRepository: IRepository<LogError>
    ) {

    }

    async logError(error: any): Promise<void> {
        c.fs('LogService > logError');
        const session = await auth();
        const logError = new LogError();
        if (session?.user?.id)
            logError.userId = session.user.id;
        logError.datetime = new Date();
        logError.detail = JSON.stringify(error).substring(0, 500);
        if (error instanceof Error) {
            logError.detail = String(error.name + " " + error.cause + " " + error.message + " " + error.stack).substring(0, 500);
        }
        this.logRepository.create(logError);
        c.fe('LogService > logError');
    }

    async reservationLogGetList(searchData: SearchFormFields, pager: PagerParams, location: string): Promise<{ logs: any[]; pager: PagerParams }> {
        c.fs('LogService > reservationLogGetList');

        const pageIndex = pager.pageIndex ?? 1;
        const pageSize = pager.pageSize ?? 10;

        const updatedByUserAlias = alias(userTable, 'updatedByUser');
        const reservationTypeAlias = alias(configTable, 'reservationType');
        const reservationStatusAlias = alias(configTable, 'reservationStatus');
        const invoiceStatusAlias = alias(configTable, 'invoiceStatus');

        let query = this.dbClient.db
            .select({
                ...reservationLogTable,
                createdByName: userTable.name,
                updatedByName: updatedByUserAlias.name,
                reservationType: reservationTypeAlias.value,
                reservationStatus: reservationStatusAlias.value,
                invoiceStatus: invoiceStatusAlias.value
            })
            .from(reservationLogTable)
            .leftJoin(userTable, eq(userTable.id, reservationLogTable.createdBy))
            .leftJoin(updatedByUserAlias, eq(updatedByUserAlias.id, reservationLogTable.updatedBy))
            .leftJoin(reservationTypeAlias, eq(reservationTypeAlias.id, reservationLogTable.reservationTypeId))
            .leftJoin(reservationStatusAlias, eq(reservationStatusAlias.id, reservationLogTable.reservationStatusId))
            .leftJoin(invoiceStatusAlias, eq(invoiceStatusAlias.id, reservationLogTable.invoiceStatusId));

        let countQuery = this.dbClient.db
            .select({ count: count(reservationLogTable.log_Id) })
            .from(reservationLogTable)
            .leftJoin(userTable, eq(userTable.id, reservationLogTable.createdBy))
            .leftJoin(updatedByUserAlias, eq(updatedByUserAlias.id, reservationLogTable.updatedBy))
            .leftJoin(reservationTypeAlias, eq(reservationTypeAlias.id, reservationLogTable.reservationTypeId))
            .leftJoin(reservationStatusAlias, eq(reservationStatusAlias.id, reservationLogTable.reservationStatusId))
            .leftJoin(invoiceStatusAlias, eq(invoiceStatusAlias.id, reservationLogTable.invoiceStatusId));

        query = query.where(eq(reservationLogTable.location, location));
        countQuery = countQuery.where(eq(reservationLogTable.location, location));

        if (searchData) {
            if (searchData.searchId) {
                query = query.where(like(reservationLogTable.id, `%${searchData.searchId}%`));
                countQuery = countQuery.where(like(reservationLogTable.id, `%${searchData.searchId}%`));
            }

            if (searchData.searchUserName) {
                const userNameSearch = `%${searchData.searchUserName}%`;
                query = query.where(or(
                    like(userTable.name, userNameSearch),
                    like(reservationLogTable.createdBy, userNameSearch)
                ));
                countQuery = countQuery.where(or(
                    like(userTable.name, userNameSearch),
                    like(reservationLogTable.createdBy, userNameSearch)
                ));
            }

            if (searchData.searchCreatedDateFrom) {
                const fromDate = new Date(searchData.searchCreatedDateFrom);
                if (!Number.isNaN(fromDate.getTime())) {
                    query = query.where(gte(reservationLogTable.triggerDateTimeUTC, fromDate));
                    countQuery = countQuery.where(gte(reservationLogTable.triggerDateTimeUTC, fromDate));
                }
            }

            if (searchData.searchCreatedDateUntil) {
                const untilDate = new Date(searchData.searchCreatedDateUntil);
                if (!Number.isNaN(untilDate.getTime())) {
                    untilDate.setHours(23, 59, 59, 999);
                    query = query.where(lte(reservationLogTable.triggerDateTimeUTC, untilDate));
                    countQuery = countQuery.where(lte(reservationLogTable.triggerDateTimeUTC, untilDate));
                }
            }
        }

        query = query.orderBy(desc(reservationLogTable.triggerDateTimeUTC));
        query = query.offset((pageIndex - 1) * pageSize).limit(pageSize);

        const [countResult, logs] = await Promise.all([countQuery.execute(), query.execute()]);

        pager.records = Number(countResult?.[0]?.count ?? 0);
        pager.pages = Math.max(1, Math.ceil((pager.records ?? 0) / pageSize));
        pager.pageIndex = pageIndex;
        pager.pageSize = pageSize;

        c.fe('LogService > reservationLogGetList');
        return { logs, pager };
    }

    async roomChargeLogGetList(searchData: SearchFormFields, pager: PagerParams, location: string): Promise<{ logs: any[]; pager: PagerParams }> {
        c.fs('LogService > roomChargeLogGetList');

        const pageIndex = pager.pageIndex ?? 1;
        const pageSize = pager.pageSize ?? 10;
        const updatedByUserAlias = alias(userTable, 'updatedByUser');

        let query = this.dbClient.db
            .select({
                ...roomChargeLogTable,
                createdByName: userTable.name,
                updatedByName: updatedByUserAlias.name,
                room: roomTable.roomNo,
                roomType: roomTypeTable.roomType
            })
            .from(roomChargeLogTable)
            .leftJoin(userTable, eq(userTable.id, roomChargeLogTable.createdBy))
            .leftJoin(updatedByUserAlias, eq(updatedByUserAlias.id, roomChargeLogTable.updatedBy))
            .leftJoin(reservationTable, eq(reservationTable.id, roomChargeLogTable.reservationId))
            .leftJoin(roomTable, eq(roomTable.id, roomChargeLogTable.roomId))
            .leftJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.roomTypeId));

        let countQuery = this.dbClient.db
            .select({ count: count(roomChargeLogTable.log_Id) })
            .from(roomChargeLogTable)
            .leftJoin(userTable, eq(userTable.id, roomChargeLogTable.createdBy))
            .leftJoin(updatedByUserAlias, eq(updatedByUserAlias.id, roomChargeLogTable.updatedBy))
            .leftJoin(reservationTable, eq(reservationTable.id, roomChargeLogTable.reservationId))
            .leftJoin(roomTable, eq(roomTable.id, roomChargeLogTable.roomId))
            .leftJoin(roomTypeTable, eq(roomTypeTable.id, roomTable.roomTypeId));

        query = query.where(eq(reservationTable.location, location));
        countQuery = countQuery.where(eq(reservationTable.location, location));

        if (searchData) {
            if (searchData.searchId) {
                const idSearch = `%${searchData.searchId}%`;
                query = query.where(or(
                    like(roomChargeLogTable.id, idSearch),
                    like(roomChargeLogTable.reservationId, idSearch)
                ));
                countQuery = countQuery.where(or(
                    like(roomChargeLogTable.id, idSearch),
                    like(roomChargeLogTable.reservationId, idSearch)
                ));
            }

            if (searchData.searchUserName) {
                const userNameSearch = `%${searchData.searchUserName}%`;
                query = query.where(or(
                    like(userTable.name, userNameSearch),
                    like(roomChargeLogTable.createdBy, userNameSearch)
                ));
                countQuery = countQuery.where(or(
                    like(userTable.name, userNameSearch),
                    like(roomChargeLogTable.createdBy, userNameSearch)
                ));
            }

            if (searchData.searchCreatedDateFrom) {
                const fromDate = new Date(searchData.searchCreatedDateFrom);
                if (!Number.isNaN(fromDate.getTime())) {
                    query = query.where(gte(roomChargeLogTable.triggerDateTimeUTC, fromDate));
                    countQuery = countQuery.where(gte(roomChargeLogTable.triggerDateTimeUTC, fromDate));
                }
            }

            if (searchData.searchCreatedDateUntil) {
                const untilDate = new Date(searchData.searchCreatedDateUntil);
                if (!Number.isNaN(untilDate.getTime())) {
                    untilDate.setHours(23, 59, 59, 999);
                    query = query.where(lte(roomChargeLogTable.triggerDateTimeUTC, untilDate));
                    countQuery = countQuery.where(lte(roomChargeLogTable.triggerDateTimeUTC, untilDate));
                }
            }
        }

        query = query.orderBy(desc(roomChargeLogTable.triggerDateTimeUTC));
        query = query.offset((pageIndex - 1) * pageSize).limit(pageSize);

        const [countResult, logs] = await Promise.all([countQuery.execute(), query.execute()]);

        pager.records = Number(countResult?.[0]?.count ?? 0);
        pager.pages = Math.max(1, Math.ceil((pager.records ?? 0) / pageSize));
        pager.pageIndex = pageIndex;
        pager.pageSize = pageSize;

        c.fe('LogService > roomChargeLogGetList');
        return { logs, pager };
    }

}