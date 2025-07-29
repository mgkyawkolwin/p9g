import { container } from '@/dicontainer';
import { HttpStatusCode } from '@/lib/constants';
import { TYPES } from '@/lib/types';
import IAuthService from '@/domain/services/contracts/IAuthService';
import { NextRequest, NextResponse } from 'next/server'
import { userSignInSchema } from '@/lib/zodschema';

import c from '@/lib/core/logger/ConsoleLogger';
import { auth, signIn } from '@/app/auth';
import { CustomError } from '@/lib/errors';
import LogError from '@/domain/models/LogError';
import ILogService from '@/domain/services/contracts/ILogService';

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
    const authService = container.get<IAuthService>(TYPES.IAuthService);
    const user = await authService.signMeIn(userName, password);
    
    //wrong credential, return response
    if(!user)
      return NextResponse.json({ message: "Invalid credentials."}, { status: HttpStatusCode.NotFound });
    
    await signIn('credentials',  {redirect : false, name:user.userName, id: user.id, role: user.role});
    //everything is right
    return NextResponse.json(user, { status: HttpStatusCode.Ok });
  }catch(error){
    c.e(error instanceof Error ? error.message : JSON.stringify(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if(error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    else
      return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}