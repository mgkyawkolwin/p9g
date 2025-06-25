
import { NextResponse, NextRequest } from "next/server"
//local import, sorted
import {auth} from "@/app/auth"
import consoleLogger from "@/lib/core/logger/ConsoleLogger";

export async function middleware(request : NextRequest) {
  try {
    //check session
    const session = await auth();
    if(session){
      
    }
    else{
      //no session, if accessing authenticated area, redirect to login page
      const { pathname, origin } = request.nextUrl;
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
      //admin urls
      if (pathname.startsWith("/admin")) {
        //return NextResponse.redirect(`${origin}/auth/signin`)
      }

      //private api
      if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
        //return NextResponse.redirect(`${origin}/auth/signin`)
      }
    }
    return NextResponse.next();
  } catch (error) {
    consoleLogger.logError(error instanceof Error ? error.message : String(error));
  }
}
