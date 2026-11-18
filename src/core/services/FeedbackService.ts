import { inject, injectable } from "inversify";
import { TYPES } from "@/core/types";
import type IRepository from "@/lib/repositories/IRepository";
import { and, asc, eq, gte } from "@/lib/transformers/types";
import SessionUser from "../models/dto/SessionUser";
import c from "@/lib/loggers/console/ConsoleLogger";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import IFeedbackService, { CustomerFeedbackItem } from "./contracts/IFeedbackService";
import Feedback from "../models/domain/Feedback";
import { CustomError } from "@/lib/errors";
import { and as dand, count as dcount, desc, eq as deq } from "drizzle-orm";
import { configTable, feedbackTable, reservationTable } from "../orms/drizzle/mysql/schema";

@injectable()
export default class FeedbackService implements IFeedbackService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IFeedbackRepository) private feedbackRepository: IRepository<Feedback>) {

    }


    async createFeedback(feedback: Feedback, sessionUser: SessionUser): Promise<void>{
        c.fs('FeedbackService > createFeedback');
        if(!feedback.reservationId) throw new CustomError('Invalid reservationId');
        if(!feedback.customerId) throw new CustomError('Invalid customerId');
        if(!feedback.feedback?.trim()) throw new CustomError('Invalid feedback');

        const newFeedback = new Feedback();
        newFeedback.reservationId = feedback.reservationId;
        newFeedback.customerId = feedback.customerId;
        newFeedback.feedback = feedback.feedback.trim();
        newFeedback.createdAtUTC = new Date();
        newFeedback.createdBy = sessionUser.id;
        newFeedback.updatedAtUTC = new Date();
        newFeedback.updatedBy = sessionUser.id;

        await this.feedbackRepository.create(newFeedback);
        c.fe('FeedbackService > createFeedback');
    }


    async findFeedbacksByReservationCustomer(reservationId: string, customerId: string, pageIndex: number, pageSize: number): Promise<[Feedback[], number]> {
        if(!reservationId) throw new CustomError('Invalid reservationId');
        if(!customerId) throw new CustomError('Invalid customerId');

        const pageSizeSafe = Math.min(Math.max(pageSize, 1), 100);
        const offset = (Math.max(pageIndex, 1) - 1) * pageSizeSafe;
        const condition = dand(deq(feedbackTable.reservationId, reservationId), deq(feedbackTable.customerId, customerId));

        const [{ total }] = await this.dbClient.db.select({ total: dcount() }).from(feedbackTable).where(condition);
        const items = await this.dbClient.db.select({ id: feedbackTable.id, feedback: feedbackTable.feedback, isTaskCreated: feedbackTable.isTaskCreated })
            .from(feedbackTable)
            .where(condition)
            .orderBy(desc(feedbackTable.createdAtUTC))
            .limit(pageSizeSafe)
            .offset(offset);

        return [items, Number(total)];
    }


    async deleteFeedback(id: string, sessionUser: SessionUser): Promise<void>{
        if(!id) throw new CustomError('Invalid feedback id');
        await this.feedbackRepository.delete(id);
    }

    async findFeedbacksByCustomerId(customerId: string, pageIndex: number, pageSize: number): Promise<[CustomerFeedbackItem[], number]> {
        if(!customerId) throw new CustomError('Invalid customerId');

        const pageSizeSafe = Math.min(Math.max(pageSize, 1), 100);
        const offset = (Math.max(pageIndex, 1) - 1) * pageSizeSafe;

        const [{ total }] = await this.dbClient.db.select({ total: dcount() })
            .from(feedbackTable)
            .where(deq(feedbackTable.customerId, customerId));

        const items = await this.dbClient.db.select({
            id: feedbackTable.id,
            reservationId: feedbackTable.reservationId,
            reservationType: configTable.text,
            checkInDate: reservationTable.checkInDate,
            checkOutDate: reservationTable.checkOutDate,
            location: reservationTable.location,
            feedback: feedbackTable.feedback
        })
            .from(feedbackTable)
            .innerJoin(reservationTable, deq(reservationTable.id, feedbackTable.reservationId))
            .leftJoin(configTable, deq(configTable.id, reservationTable.reservationTypeId))
            .where(deq(feedbackTable.customerId, customerId))
            .orderBy(desc(reservationTable.checkInDate))
            .limit(pageSizeSafe)
            .offset(offset);

        return [items, Number(total)];
    }


}