import { NextRequest } from "next/server";
import { WinstonLoger } from "@/core/loggers/winston/WinstonLogger";

export const config = {
    runtime: 'nodejs', // Explicit Node.js runtime
  };

export async function log(request : NextRequest) {
  try {
    console.log('Log middleware is called.');
    const logger = new WinstonLoger();
    logger.logError("This is serious error.");
    
  } catch (error) {
    console.log(error);
    throw error;
  }
}
