import Media from "@/core/models/domain/Media";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IMediaService {

    createMedia(media: Media, sessionUser: SessionUser): Promise<void>;
    deleteMedia(mediaId: string, sessionUser: SessionUser): Promise<void>;

}