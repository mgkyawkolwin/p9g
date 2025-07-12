import { injectable, inject } from 'inversify';

import c from '@/lib/core/logger/ConsoleLogger';
import type IUserRepository from '@/data/repo/IUserRepository';
import type IUserService from "./contracts/IUserService";
import { UserEntity } from "@/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam, TYPES } from '@/lib/types';


@injectable()
export default class UserService implements IUserService{

    constructor(@inject(TYPES.IUserRepository) private userRepository : IUserRepository){

    }


    async userCreate(userPosted: UserEntity): Promise<UserEntity> {
      c.i('UserService > userCreate');
      const result = await this.userRepository.create(userPosted);
      return result;
    }


    async userDelete(id: number): Promise<boolean> {
      c.i('UserService > userDelete');
      const result = await this.userRepository.delete(id);
      return result;
    }


    async userFindAll(pagerParams : PagerParams): Promise<UserEntity[]> {
      c.i('UserService > userFindMany');
      const result = await this.userRepository.findAll(pagerParams);
      return result;
    }


    async userFindMany(searchParams:SearchParam[], pagerParams : PagerParams): Promise<[UserEntity[], PagerParams]> {
      c.i('UserService > userFindMany');
      const result = await this.userRepository.findMany(searchParams, pagerParams);
      return result;
    }


    async userFindByEmailAndPassword(email:string, password:string): Promise<UserEntity | null> {
      c.i('UserService > userFindByEmailAndPassword');
      const result = await this.userRepository.findByEmailAndPassword(email,password);
      return result;
    }

    
    async userFindByUserName(userName: string): Promise<UserEntity | null> {
      c.i('UserService > userFindByUserName');
      const result = await this.userRepository.findByUserName(userName);
      return result;
    }

    
    async userFindByUserNameAndPassword(userName: string, password: string): Promise<UserEntity | null> {
      c.i('UserService > userFindByUserNameAndPassword');
      const result = await this.userRepository.findByUserNameAndPassword(userName,password);
      return result;
    }


    async userFindById(id: number): Promise<UserEntity | null> {
      c.i('UserService > userFindById');
      c.d(String(id));
      const result = await this.userRepository.findById(id);
      return result;
    }


    async userUpdate(id:number, userPosted: UserEntity): Promise<UserEntity> {
      c.i('UserService > userUpdate');
      const result = await this.userRepository.update(id, userPosted);
      return result;
    }

}