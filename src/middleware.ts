
import { NextResponse, NextRequest } from "next/server"
import {auth} from "@/app/auth";
import c from "@/lib/core/logger/ConsoleLogger";
import { HttpStatusCode } from "./lib/constants";

export async function middleware(request : NextRequest) {
  try {
    //check session
    const session = await auth();
    if(session){

    }
    else{
      //no session, if accessing authenticated area, redirect to login page
      const { pathname, origin } = request.nextUrl;
      if (pathname === '/console') {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }
      //admin urls
      if (pathname.startsWith("/console")) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      //private api
      if (pathname.startsWith("/api") && !pathname.startsWith("/api/auth")) {
        return NextResponse.json({message : 'Unauthorized request.'}, {status: HttpStatusCode.Unauthorized});
      }
    }
    return NextResponse.next();
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
  }
}
