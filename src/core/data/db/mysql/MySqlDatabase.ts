import { injectable } from 'inversify';
import { MySql2Database, drizzle} from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';

import { IDatabaseClient } from '../../../../lib/db/IDatabase';
import * as schema from '@/core/data/orm/drizzle/mysql/schema';

export type MySqlDbType = MySql2Database<typeof schema>;
export type TransactionType = Parameters<Parameters<MySqlDbType["transaction"]>[0]>[0];

@injectable()
export class MySqlDatabaseClient implements IDatabaseClient<MySqlDbType>{
  private _db: MySqlDbType;

  constructor() {
    const pool = mysql.createPool({
      uri: process.env.DATABASE_URL!,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      idleTimeout: 60000,
      enableKeepAlive: true
    });
    this._db = drizzle(pool, { schema, mode: 'default' });
  }

  public get db(): MySqlDbType {
    return this._db;
  }
}