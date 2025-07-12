import { injectable, inject } from 'inversify';
import argon2 from 'argon2';

import IAuthService from "./contracts/IAuthService";
import type IUserService from './contracts/IUserService';
import { TYPES } from '@/lib/types';
import { UserEntity } from '@/data/orm/drizzle/mysql/schema';

@injectable()
export default class AuthService implements IAuthService{

    constructor(@inject(TYPES.IUserService) private userService : IUserService){

    }

    async signMeIn(userName: string, password: string): Promise<UserEntity | null> {
        //retrieve user based on userName
        const user = await this.userService.userFindByUserName(userName);

        //user not found
        if(!user)
            return null;

        //compare password
        const isValid = await argon2.verify(user.password, password);

        //not valid password
        if(!isValid)
            return null;

        //everyting fine
        return user;
    }
    
}