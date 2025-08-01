import { injectable, inject } from 'inversify';
import argon2 from 'argon2';

import IAuthService from "./contracts/IAuthService";
import type IUserService from './contracts/IUserService';
import { TYPES } from '@/lib/types';
import { UserEntity } from '@/data/orm/drizzle/mysql/schema';
import c from '@/lib/core/logger/ConsoleLogger';

@injectable()
export default class AuthService implements IAuthService{

    constructor(@inject(TYPES.IUserService) private userService : IUserService){

    }

    async signMeIn(userName: string, password: string): Promise<UserEntity | null> {
        c.i('Auth Service > signMeIn');
        c.d(userName);
        //retrieve user based on userName
        const user = await this.userService.userFindByUserName(userName);

        //user not found
        if(!user){
            c.i('User not found.');
            return null;
        }
            

        c.i('Found user. Compare password.');
        console.log(await argon2.hash(password))


        //compare password
        const isValid = await argon2.verify(user.password, password);

        //not valid password
        if(!isValid)
            return null;

        //everyting fine
        return user;
    }
    
}