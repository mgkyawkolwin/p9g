import { injectable, inject } from 'inversify';
import argon2 from 'argon2';

import IAuthService from "./contracts/IAuthService";
import type IUserService from './contracts/IUserService';
import { TYPES } from '@/lib/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import User from '../models/domain/User';

@injectable()
export default class AuthService implements IAuthService {

    constructor(@inject(TYPES.IUserService) private userService: IUserService) {

    }

    async signMeIn(userName: string, password: string): Promise<User | null> {
        c.fs('AuthService > signMeIn');
        c.d(userName);
        //retrieve user based on userName
        const user = await this.userService.userFindByUserName(userName, null);

        //user not found
        if (!user) {
            c.i('User not found.');
            return null;
        }

        //compare password
        const isValid = await argon2.verify(user.password, password);

        //not valid password
        if (!isValid)
            return null;

        //everyting fine
        return user;
    }

}