import { injectable, inject } from 'inversify';
import argon2 from 'argon2';

import IAuthService from "./contracts/IAuthService";
import type IUserService from './contracts/IUserService';
import { TYPES } from '@/core/types';
import c from '@/lib/loggers/console/ConsoleLogger';
import User from '../models/domain/User';

@injectable()
export default class AuthService implements IAuthService {

    constructor(@inject(TYPES.IUserService) private userService: IUserService) {

    }

    async generateHash(password: string): Promise<string> {
        c.fs('AuthService > generateHash');
        return await argon2.hash(password);
    }

    private dummyHash: Promise<string> | null = null;

    //hash used to keep response timing equal when the user does not exist
    private getDummyHash(): Promise<string> {
        if (!this.dummyHash) this.dummyHash = argon2.hash('p9g-timing-dummy-password');
        return this.dummyHash;
    }

    async signMeIn(userName: string, password: string): Promise<User | null> {
        c.fs('AuthService > signMeIn');
        //retrieve user based on userName
        const user = await this.userService.userFindByUserName(userName, null);

        //user not found, still run a hash verification to avoid user enumeration by timing
        if (!user) {
            await argon2.verify(await this.getDummyHash(), password).catch(() => false);
            c.i('User not found.');
            return null;
        }

        //compare password (a malformed stored hash is treated as invalid)
        const isValid = await argon2.verify(user.password, password).catch(() => false);

        //not valid password
        if (!isValid)
            return null;

        //everyting fine
        return user;
    }

}