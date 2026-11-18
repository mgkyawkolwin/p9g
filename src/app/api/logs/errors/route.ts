import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/app/auth";
import { HttpStatusCode } from "@/core/constants";
import { container } from "@/core/di/dicontainer";
import { getPagerWithDefaults } from "@/core/helpers";
import { TYPES } from "@/core/types";
import type ILogService from "@/core/services/contracts/ILogService";
import { pagerValidator, searchValidator } from "@/core/validators/zodschema";
import c from "@/lib/loggers/console/ConsoleLogger";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user)
      return NextResponse.json({ message: "Invalid session" }, { status: HttpStatusCode.Unauthorized });
    if (session.user.role !== "ADMIN")
      return NextResponse.json({ message: "Forbidden" }, { status: HttpStatusCode.Forbidden });

    const params = Object.fromEntries(request.nextUrl.searchParams);
    const search = searchValidator.safeParse(params);
    const parsedPager = pagerValidator.safeParse(params);
    const pager = getPagerWithDefaults(parsedPager.success ? parsedPager.data : {});
    if (!Number.isInteger(pager.pageIndex) || pager.pageIndex! < 1 ||
        !Number.isInteger(pager.pageSize) || pager.pageSize! < 1 || pager.pageSize! > 100) {
      return NextResponse.json({ message: "Invalid pagination" }, { status: HttpStatusCode.BadRequest });
    }

    const service = container.get<ILogService>(TYPES.ILogService);
    const result = await service.errorLogGetList(search.success ? search.data : {}, pager);
    return NextResponse.json({ data: result }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json({ message: "Error log list retrieval failed." }, { status: HttpStatusCode.ServerError });
  }
}