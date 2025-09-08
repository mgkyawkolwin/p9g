import { injectable, inject } from 'inversify';

import c from '@/core/logger/console/ConsoleLogger';
import type IUserRepository from '@/core/data/repo/contracts/IUserRepository';
import type IUserService from "./contracts/IUserService";
import { UserEntity } from "@/core/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam, TYPES } from '@/core/lib/types';
import User from '../models/User';


@injectable()
export default class UserService implements IUserService{

    constructor(@inject(TYPES.IUserRepository) private userRepository : IUserRepository){

    }


    async userCreate(userPosted: User, sessionUser: SessionUser): Promise<User> {
      c.fs('UserService > userCreate');
      userPosted.createdBy = sessionUser.id;
      userPosted.updatedBy = sessionUser.id;
      const result = await this.userRepository.create(userPosted as any as UserEntity);
      const user = result as any as User;
      c.fe('UserService > userCreate');
      return user;
    }


    async userDelete(id: number, sessionUser: SessionUser): Promise<boolean> {
      c.fs('UserService > userDelete');
      const result = await this.userRepository.delete(String(id));
      c.fe('UserService > userDelete');
      return result;
    }


    async userFindAll(pagerParams : PagerParams, sessionUser: SessionUser): Promise<User[]> {
      c.fs('UserService > userFindAll');
      const result = await this.userRepository.findAll(pagerParams);
      const users = result as any as User[];
      c.fe('UserService > userFindAll');
      return users;
    }


    async userFindMany(searchParams:SearchParam[], pagerParams : PagerParams, sessionUser: SessionUser): Promise<[User[], PagerParams]> {
      c.fs('UserService > userFindMany');
      const result = await this.userRepository.findMany(searchParams, pagerParams);
      const users = result as any as User[];
      c.fe('UserService > userFindMany');
      return result;
    }


    async userFindByEmailAndPassword(email:string, password:string, sessionUser: SessionUser): Promise<User | null> {
      c.fs('UserService > userFindByEmailAndPassword');
      const result = await this.userRepository.findByEmailAndPassword(email,password);
      c.fe('UserService > userFindByEmailAndPassword');
      return result;
    }

    
    async userFindByUserName(userName: string, sessionUser: SessionUser): Promise<User | null> {
      c.fs('UserService > userFindByUserName');
      const result = await this.userRepository.findByUserName(userName);
      c.fe('UserService > userFindByUserName');
      return result;
    }

    
    async userFindByUserNameAndPassword(userName: string, password: string, sessionUser: SessionUser): Promise<User | null> {
      c.fs('UserService > userFindByUserNameAndPassword');
      const result = await this.userRepository.findByUserNameAndPassword(userName,password);
      c.fe('UserService > userFindByUserNameAndPassword');
      return result;
    }


    async userFindById(id: number, sessionUser: SessionUser): Promise<User | null> {
      c.fs('UserService > userFindById');
      c.d(String(id));
      const result = await this.userRepository.findById(String(id));
      c.fe('UserService > userFindById');
      return result;
    }


    async userUpdate(id:number, userPosted: User, sessionUser: SessionUser): Promise<User> {
      c.fs('UserService > userUpdate');
      userPosted.updatedBy = sessionUser.id;
      const result = await this.userRepository.update(String(id), userPosted);
      c.fe('UserService > userUpdate');
      return result;
    }

}