// scripts/seed.ts
import { drizzle } from 'drizzle-orm/mysql2';
import { config } from '@/data/orm/drizzle/mysql/schema';
import {MySqlDatabase} from '@/data/db/mysql/MySqlDatabase';
import dotenv from 'dotenv';
import argon2 from 'argon2';

dotenv.config();

async function main() {
  const hashedPassword = await argon2.hash('admin');
  console.log(hashedPassword);


  process.exit(0);
};

main();

// Run with: tsx scripts/seed.ts