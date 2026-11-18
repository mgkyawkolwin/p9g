import Media from "@/core/models/domain/Media";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IMediaService {

    createMedia(media: Media, sessionUser: SessionUser, mediaGroupValue?: string): Promise<void>;
    createCustomerMedia(media: Media, sessionUser: SessionUser): Promise<void>;
    findMediasByCustomerId(customerId: string): Promise<Media[]>;
    deleteMedia(mediaId: string, sessionUser: SessionUser): Promise<void>;

}