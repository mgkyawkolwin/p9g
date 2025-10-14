
import { NextResponse, NextRequest } from "next/server"
import {auth} from "@/app/auth";
import c from "@/lib/loggers/console/ConsoleLogger";
import { HttpStatusCode } from "./core/constants";
// import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import IAuthorizer from "./core/authorization/IAuthorizer";
import ConfigAuthorizer from "./core/authorization/ConfigAuthorizer";

export async function middleware(request : NextRequest) {
  try {
    //check session
    const session = await auth();
    if(session && session.user && session.user.id){
      const authorizer = new ConfigAuthorizer();
      //check access to authenticated area
      const { pathname, origin } = request.nextUrl;
      if (pathname.startsWith("/console")) {
        //check permission
        const isAuthorized = authorizer.isAuthorized(session.user, pathname, null);
        if(!isAuthorized){
          //redirect to forbidden page
          return NextResponse.redirect(new URL('/forbidden', request.url));
        }
      }
    }
    else{
      //no session, if accessing authenticated area, redirect to login page
      const { pathname, origin } = request.nextUrl;
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
