import { container } from '@/core/di/dicontainer';
import { HttpStatusCode } from '@/core/constants';
import { TYPES } from '@/core/types';
import IAuthService from '@/core/services/contracts/IAuthService';
import { NextRequest, NextResponse } from 'next/server';

import c from '@/lib/loggers/console/ConsoleLogger';
import { CustomError } from '@/lib/errors';
import ILogService from '@/core/services/contracts/ILogService';

export async function GET(request: NextRequest, context: { params: Promise<{ password: string }> }) {
  try {
    c.fs('GET /api/auth/generate/[password]');
    c.d(JSON.stringify(request));

    const { password } = await context.params;
    const plainPassword = decodeURIComponent(password || '');

    if (!plainPassword || plainPassword.trim() === '') {
      return NextResponse.json({ message: 'Password is required.' }, { status: HttpStatusCode.BadRequest });
    }

    const authService = container.get<IAuthService>(TYPES.IAuthService);
    const hashedPassword = await authService.generateHash(plainPassword);

    c.fe('GET /api/auth/generate/[password]');
    return NextResponse.json({ data: { hashedPassword } }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : JSON.stringify(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    else
      return NextResponse.json({ message: 'Unknow error occured.' }, { status: HttpStatusCode.ServerError });
  }
}
