import { container } from '@/dicontainer';
import { HttpStatusCode } from '@/lib/constants';
import { TYPES } from '@/lib/types';
import IUserService from '@/services/contracts/IUserService';
import { NextRequest, NextResponse } from 'next/server'
import { userSignInSchema } from '@/lib/zodschema';

import consoleLogger from '@/lib/core/logger/ConsoleLogger';

export async function POST(request: NextRequest) {
  try{
    consoleLogger.logInfo('/api/auth/signin/route.ts is called.');
    consoleLogger.logDebug(JSON.stringify(request));

    //parse and validate data
    const data = await request.json();
    const parsedData = await userSignInSchema.safeParseAsync(data);
    
    //validation failed, return response
    if(!parsedData.success){
      return NextResponse.json({ message: "Invalid credentials."}, { status: HttpStatusCode.BadRequest });
    }

    //validation pass, check db
    const { userName, password } = parsedData.data;
    const userService = container.get<IUserService>(TYPES.IUserServce);
    const user = await userService.userFindByUserNameAndPassword(userName, password);
    
    //wrong credential, return response
    if(!user)
      return NextResponse.json({ message: "Invalid credentials."}, { status: HttpStatusCode.NotFound });
    
    //everything is right
    return NextResponse.json(user, { status: HttpStatusCode.Ok });
  }catch(error){
    consoleLogger.logError(error.message);
    return NextResponse.json({ message: "Unknown error occured."}, { status: HttpStatusCode.ServerError });
  }
}