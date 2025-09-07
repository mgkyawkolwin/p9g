import { injectable, inject } from 'inversify';

import c from '@/core/logger/console/ConsoleLogger';
import type IUserRepository from '@/core/data/repo/contracts/IUserRepository';
import type IUserService from "./contracts/IUserService";
import { UserEntity } from "@/core/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam, TYPES } from '@/core/lib/types';


@injectable()
export default class UserService implements IUserService{

    constructor(@inject(TYPES.IUserRepository) private userRepository : IUserRepository){

    }


    async userCreate(userPosted: UserEntity): Promise<UserEntity> {
      c.fs('UserService > userCreate');
      const result = await this.userRepository.create(userPosted);
      c.fe('UserService > userCreate');
      return result;
    }


    async userDelete(id: number): Promise<boolean> {
      c.fs('UserService > userDelete');
      const result = await this.userRepository.delete(String(id));
      c.fe('UserService > userDelete');
      return result;
    }


    async userFindAll(pagerParams : PagerParams): Promise<UserEntity[]> {
      c.fs('UserService > userFindAll');
      const result = await this.userRepository.findAll(pagerParams);
      c.fe('UserService > userFindAll');
      return result;
    }


    async userFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[UserEntity[], PagerParams]> {
      c.fs('UserService > userFindMany');
      const result = await this.userRepository.findMany(searchParams, pagerParams);
      c.fe('UserService > userFindMany');
      return result;
    }


    async userFindByEmailAndPassword(email:string, password:string): Promise<UserEntity | null> {
      c.fs('UserService > userFindByEmailAndPassword');
      const result = await this.userRepository.findByEmailAndPassword(email,password);
      c.fe('UserService > userFindByEmailAndPassword');
      return result;
    }

    
    async userFindByUserName(userName: string): Promise<UserEntity | null> {
      c.fs('UserService > userFindByUserName');
      const result = await this.userRepository.findByUserName(userName);
      c.fe('UserService > userFindByUserName');
      return result;
    }

    
    async userFindByUserNameAndPassword(userName: string, password: string): Promise<UserEntity | null> {
      c.fs('UserService > userFindByUserNameAndPassword');
      const result = await this.userRepository.findByUserNameAndPassword(userName,password);
      c.fe('UserService > userFindByUserNameAndPassword');
      return result;
    }


    async userFindById(id: number): Promise<UserEntity | null> {
      c.fs('UserService > userFindById');
      c.d(String(id));
      const result = await this.userRepository.findById(String(id));
      c.fe('UserService > userFindById');
      return result;
    }


    async userUpdate(id:number, userPosted: UserEntity): Promise<UserEntity> {
      c.fs('UserService > userUpdate');
      const result = await this.userRepository.update(String(id), userPosted);
      c.fe('UserService > userUpdate');
      return result;
    }

}