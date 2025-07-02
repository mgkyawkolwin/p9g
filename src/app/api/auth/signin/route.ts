import { container } from '@/dicontainer';
import { HttpStatusCode } from '@/lib/constants';
import { TYPES } from '@/lib/types';
import IUserService from '@/services/contracts/IUserService';
import IAuthService from '@/services/contracts/IAuthService';
import { NextRequest, NextResponse } from 'next/server'
import { userSignInSchema } from '@/lib/zodschema';

import c from '@/lib/core/logger/ConsoleLogger';

export async function POST(request: NextRequest) {
  try{
    c.i('/api/auth/signin/route.ts is called.');
    c.d(JSON.stringify(request));

    //parse and validate data
    const data = await request.json();
    const parsedData = await userSignInSchema.safeParseAsync(data);
    
    //validation failed, return response
    if(!parsedData.success){
      return NextResponse.json({ message: "Invalid credentials."}, { status: HttpStatusCode.BadRequest });
    }

    //validation pass, check db
    const { userName, password } = parsedData.data;
    const userService = container.get<IAuthService>(TYPES.IAuthService);
    const user = await userService.signMeIn(userName, password);
    
    //wrong credential, return response
    if(!user)
      return NextResponse.json({ message: "Invalid credentials."}, { status: HttpStatusCode.NotFound });
    
    //everything is right
    return NextResponse.json(user, { status: HttpStatusCode.Ok });
  }catch(error){
    c.e(error instanceof Error ? error.message : JSON.stringify(error));
    return NextResponse.json({ message: "Unknown error occured."}, { status: HttpStatusCode.ServerError });
  }
}