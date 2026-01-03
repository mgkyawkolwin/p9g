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
import IMediaService from "./contracts/IMediaService";
import Media from "../models/domain/Media";
import path from "path";
import { unlink } from "fs/promises";

@injectable()
export default class MediaService implements IMediaService {

    constructor(
        @inject(TYPES.IDatabase) protected readonly dbClient: IDatabaseClient<any>,
        @inject(TYPES.IMediaRepository) private mediaRepository: IRepository<Media>) {

    }


    async createMedia(media: Media, sessionUser: SessionUser): Promise<void> {
        c.fs('MediaService > createMedia');
        if(!media) throw new CustomError('Invalid media object');
        if(!media.reservationId) throw new CustomError('Invalid reservationId');
        if(!media.customerId) throw new CustomError('Invalid customerId');
        if(!media.url) throw new CustomError('Invalid media url');

        const newMedia = new Media();
        newMedia.id = media.id;
        newMedia.reservationId = media.reservationId;
        newMedia.customerId = media.customerId;
        newMedia.url = media.url;
        newMedia.createdAtUTC = new Date();
        newMedia.createdBy = sessionUser.id;
        newMedia.updatedAtUTC = new Date();
        newMedia.updatedBy = sessionUser.id;

        await this.mediaRepository.create(newMedia);
        c.fe('MediaService > createMedia');
    }


    async deleteMedia(mediaId: string, sessionUser: SessionUser): Promise<void> {
        c.fs('MediaService > deleteMedia');
        if(!mediaId) throw new CustomError('Invalid mediaId');

        const media = await this.mediaRepository.findById(mediaId);
        if(!media) throw new CustomError('Media not found');

        //find file and delete from storage
        const filePath = path.join(process.cwd(), 'public', media.url);
        await unlink(filePath);

        await this.mediaRepository.delete(mediaId);
        c.fe('MediaService > deleteMedia');
    }


}