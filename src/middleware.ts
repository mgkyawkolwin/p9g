
import { NextResponse, NextRequest } from "next/server"
import {auth} from "@/app/auth";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "./core/constants";
// import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import IAuthorizer from "./core/authorization/IAuthorizer";
import ConfigAuthorizer from "./core/authorization/ConfigAuthorizer";

// console pages are served under /{location}/console/... (and may also be requested as /console/...)
const consolePathPattern = /^(\/[^/]+)?\/console(\/|$)/;
const privateApiPathPattern = /^\/api(?!\/auth(\/|$)|\/public(\/|$))/;

export async function middleware(request : NextRequest) {
  const { pathname } = request.nextUrl;
  try {
    //check session
    const session = await auth();
    if(session && session.user && session.user.id){
      const authorizer = new ConfigAuthorizer();
      //check permission for the top-level console area
      if (pathname.startsWith("/console")) {
        const isAuthorized = authorizer.isAuthorized(session.user, pathname, null);
        if(!isAuthorized){
          //redirect to forbidden page
          return NextResponse.redirect(new URL('/forbidden', request.url));
        }
      }
    }
    else{
      //no session, if accessing authenticated area, redirect to login page
      if (consolePathPattern.test(pathname)) {
        return NextResponse.redirect(new URL('/auth/signin', request.url))
      }

      //private api
      if (privateApiPathPattern.test(pathname)) {
        return NextResponse.json({message : 'Unauthorized request.'}, {status: HttpStatusCode.Unauthorized});
      }
    }
    return NextResponse.next();
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    //fail closed for protected areas
    if (consolePathPattern.test(pathname))
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    if (privateApiPathPattern.test(pathname))
      return NextResponse.json({message : 'Unauthorized request.'}, {status: HttpStatusCode.Unauthorized});
    return NextResponse.next();
  }
}

