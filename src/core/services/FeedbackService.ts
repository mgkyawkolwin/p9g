import { inject, injectable } from "inversify";
import { TYPES } from "@/core/types";
import type IRepository from "@/lib/repositories/IRepository";
import { and, asc, eq, gte } from "@/lib/transformers/types";
import SessionUser from "../models/dto/SessionUser";
import c from "@/lib/loggers/console/ConsoleLogger";
import type { IDatabaseClient } from "@/lib/db/IDatabase";
import IFeedbackService from "./contracts/IFeedbackService";
import Feedback from "../models/domain/Feedback";
import { CustomError } from "@/lib/errors";

@injectable()
export default class FeedbackService implements IFeedbackService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IFeedbackRepository) private feedbackRepository: IRepository<Feedback>) {

    }


    async createOrUpdateFeedback(feedback: Feedback, sessionUser: SessionUser): Promise<void>{
        c.fs('FeedbackService > createOrUpdateFeedback');
        if(!feedback.reservationId) throw new CustomError('Invalid reservationId');
        if(!feedback.customerId) throw new CustomError('Invalid customerId');
        if(!feedback.feedback) throw new CustomError('Invalid feedback');

        const existingFeedback = await this.feedbackRepository.findOne(and(
            eq("reservationId", feedback.reservationId),
            eq("customerId", feedback.customerId)
        ));
        if(existingFeedback){
            c.i('Updating existing feedback record');
            existingFeedback.feedback = feedback.feedback;
            existingFeedback.updatedAtUTC = new Date();
            existingFeedback.updatedBy = sessionUser.id;

            await this.feedbackRepository.update(existingFeedback.id, existingFeedback);
            c.fe('FeedbackService > createOrUpdateFeedback');
            return;
        }

        c.i('Creating new feedback record');
        const newFeedback = new Feedback();
        newFeedback.reservationId = feedback.reservationId;
        newFeedback.customerId = feedback.customerId;
        newFeedback.feedback = feedback.feedback;
        newFeedback.createdAtUTC = new Date();
        newFeedback.createdBy = sessionUser.id;
        newFeedback.updatedAtUTC = new Date();
        newFeedback.updatedBy = sessionUser.id;

        await this.feedbackRepository.create(newFeedback);
        c.fe('FeedbackService > createOrUpdateFeedback');
    }


}