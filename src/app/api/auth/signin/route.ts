import { container } from '@/core/di/dicontainer';
import { HttpStatusCode } from '@/core/constants';
import { TYPES } from '@/core/types';
import IAuthService from '@/core/services/contracts/IAuthService';
import { NextRequest, NextResponse } from 'next/server'
import { userSignInSchema } from '@/core/validators/zodschema';

import c from '@/lib/loggers/console/ConsoleLogger';
import { auth, signIn } from '@/app/auth';
import { CustomError } from '@/lib/errors';
import LogError from '@/core/models/domain/LogError';
import ILogService from '@/core/services/contracts/ILogService';

export async function POST(request: NextRequest) {
  try{
    c.fs('POST /api/auth/signin');
    c.d(JSON.stringify(request));

    //parse and validate data;
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
    c.fe('POST /api/auth/signin');
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