import { injectable, inject } from 'inversify';

import c from '@/lib/loggers/console/ConsoleLogger';
import type IUserService from "./contracts/IUserService";
import { PagerParams, TYPES } from '@/core/types';
import User from '../models/domain/User';
import SessionUser from '../models/dto/SessionUser';
import { CustomError } from '@/lib/errors';
import type IRepository from '@/lib/repositories/IRepository';
import { and, eq } from '@/lib/transformers/types';


@injectable()
export default class UserService implements IUserService {

  constructor(
    @inject(TYPES.IUserRepository) private readonly userRepository: IRepository<User>
  ) {

  }


  async userCreate(user: User, sessionUser: SessionUser): Promise<User> {
    c.fs('UserService > userCreate');
    user.createdAtUTC = new Date();
    user.createdBy = sessionUser.id;
    user.updatedAtUTC = new Date();
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


  async userFindMany(searchParams: Record<string,any>, pagerParams: PagerParams, sessionUser: SessionUser): Promise<[User[], number]> {
    c.fs('UserService > userFindMany');
    const result = await this.userRepository.findMany(searchParams, null, pagerParams.pageIndex * pagerParams.pageSize, pagerParams.pageSize);
    const users = result as any as User[];
    c.fe('UserService > userFindMany');
    return result;
  }


  async userFindByEmailAndPassword(email: string, password: string, sessionUser: SessionUser): Promise<User | null> {
    c.fs('UserService > userFindByEmailAndPassword');
    if(!email || !password)
      throw new CustomError('Email or password is missing.');
    // const result = await this.userRepository.findByEmailAndPassword(email, password);
    const result = await this.userRepository.findOne({email, password});
    c.fe('UserService > userFindByEmailAndPassword');
    return result;
  }


  async userFindByUserName(userName: string, sessionUser: SessionUser): Promise<User | null> {
    c.fs('UserService > userFindByUserName');
    // const result = await this.userRepository.findByUserName(userName);
    const result = await this.userRepository.findOne(eq("userName", userName));
    c.fe('UserService > userFindByUserName');
    return result;
  }


  async userFindByUserNameAndPassword(userName: string, password: string, sessionUser: SessionUser): Promise<User | null> {
    c.fs('UserService > userFindByUserNameAndPassword');
    // const result = await this.userRepository.findByUserNameAndPassword(userName, password);
    if(!userName || !password)
      throw new CustomError('Username or password is missing.');
    const result = await this.userRepository.findOne(and(eq("userName", userName), eq("password", password)));
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
    userPosted.updatedAtUTC = new Date();
    userPosted.updatedBy = sessionUser.id;

    await this.userRepository.update(id, userPosted);
    c.fe('UserService > userUpdate');
  }

}