import Room from "@/core/models/domain/Room";
import SessionUser from "@/core/models/dto/SessionUser";


export default interface IRoomService {

    getRooms(sessionUser: SessionUser): Promise<Room[]>;

}