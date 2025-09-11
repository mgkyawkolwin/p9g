import { injectable, inject } from 'inversify';

import c from '@/core/loggers/console/ConsoleLogger';
import type IUserRepository from '@/core/data/repo/contracts/IUserRepository';
import type IUserService from "./contracts/IUserService";
import { UserEntity } from "@/core/data/orm/drizzle/mysql/schema"
import { PagerParams, SearchParam, TYPES } from '@/core/lib/types';
import User from '../models/User';
import SessionUser from '../dtos/SessionUser';
import IMapper from '@/core/lib/mappers/IMapper';
import type IQueryObjectTranformer from '@/core/lib/transformers/IQueryObjectTransformer';
import { SQL } from 'drizzle-orm';
import { CustomError } from '@/core/lib/errors';


@injectable()
export default class UserService implements IUserService {

  constructor(
    @inject(TYPES.IUserRepository) private readonly userRepository: IUserRepository,
    @inject(TYPES.IQueryObjectTransformer) private readonly queryObjectTransformer: IQueryObjectTranformer
  ) {

  }


  async userCreate(user: User, sessionUser: SessionUser): Promise<User> {
    c.fs('UserService > userCreate');
    user.createdBy = sessionUser.id;
    user.updatedBy = sessionUser.id;
    const result = await this.userRepository.create(user);
    const userCreated = result as any as User;
    c.fe('UserService > userCreate');
    return userCreated;
  }


  async userDelete(id: string, sessionUser: SessionUser): Promise<void> {
    c.fs('UserService > userDelete');
    await this.userRepository.delete(String(id));
    c.fe('UserService > userDelete');
  }


  async userFindMany(searchParams: object, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[User[], number]> {
    c.fs('UserService > userFindMany');
    let condition = null;
    if (searchParams)
      condition = await this.queryObjectTransformer.transform<SQL, object>(searchParams);
    const result = await this.userRepository.findMany(condition, null, pagerParams.pageIndex * pagerParams.pageSize, pagerParams.pageSize);
    const users = result as any as User[];
    c.fe('UserService > userFindMany');
    return result;
  }


  async userFindByEmailAndPassword(email: string, password: string, sessionUser: SessionUser): Promise<User | null> {
    c.fs('UserService > userFindByEmailAndPassword');
    if(!email || !password)
      throw new CustomError('Email or password is missing.');
    const condition = await this.queryObjectTransformer.transform<SQL, object>({email, password});
    // const result = await this.userRepository.findByEmailAndPassword(email, password);
    const result = await this.userRepository.findOne(condition);
    c.fe('UserService > userFindByEmailAndPassword');
    return result;
  }


  async userFindByUserName(userName: string, sessionUser: SessionUser): Promise<User | null> {
    c.fs('UserService > userFindByUserName');
    // const result = await this.userRepository.findByUserName(userName);
    const condition = await this.queryObjectTransformer.transform<SQL, object>({userName});
    const result = await this.userRepository.findOne(condition);
    c.fe('UserService > userFindByUserName');
    return result;
  }


  async userFindByUserNameAndPassword(userName: string, password: string, sessionUser: SessionUser): Promise<User | null> {
    c.fs('UserService > userFindByUserNameAndPassword');
    // const result = await this.userRepository.findByUserNameAndPassword(userName, password);
    if(!userName || !password)
      throw new CustomError('Username or password is missing.');
    const condition = await this.queryObjectTransformer.transform<SQL, object>({userName, password});
    const result = await this.userRepository.findOne(condition);
    c.fe('UserService > userFindByUserNameAndPassword');
    return result;
  }


  async userFindById(id: string, sessionUser: SessionUser): Promise<User | null> {
    c.fs('UserService > userFindById');
    c.d(String(id));
    const result = await this.userRepository.findById(id);
    c.fe('UserService > userFindById');
    return result;
  }


  async userUpdate(id: string, userPosted: User, sessionUser: SessionUser): Promise<void> {
    c.fs('UserService > userUpdate');
    userPosted.updatedBy = sessionUser.id;
    await this.userRepository.update(id, userPosted);
    c.fe('UserService > userUpdate');
  }

}