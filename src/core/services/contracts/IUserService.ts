import { PagerParams, SearchParam } from "@/lib/types";
import User from "../../models/domain/User";
import SessionUser from "../../models/dto/SessionUser";


export default interface IUserService {

    userCreate(user: User, sessionUser: SessionUser): Promise<User>;
    userDelete(id: string, sessionUser: SessionUser): Promise<void>;
    userFindByUserName(userName: string, sessionUser: SessionUser): Promise<User | null>;
    userFindByUserNameAndPassword(userName: string, password: string, sessionUser: SessionUser): Promise<User | null>;
    userFindByEmailAndPassword(email: string, password: string, sessionUser: SessionUser): Promise<User | null>;
    userFindById(id: string, sessionUser: SessionUser): Promise<User | null>;
    userFindMany(searchParams: Record<string, any>, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[User[], number]>;
    userUpdate(id: string, user: User, sessionUser: SessionUser): Promise<void>;

}