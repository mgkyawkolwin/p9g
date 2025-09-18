import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES, SearchParam } from "@/lib/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { customerValidator, pagerValidator, searchValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { getPagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/core/services/contracts/ICustomerService";
import Customer from "@/core/models/domain/Customer";
import { CustomError } from "@/lib/errors";
import ILogService from "@/core/services/contracts/ILogService";
import { auth } from "@/app/auth";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/customers");
    c.d(JSON.stringify(request));

    const session = await auth();
    if(!session?.user)
        throw new CustomError('Invalid session');

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //validate search params
    // let searchFields: SearchParam[] = [];
    const searchValidatedFields = await searchValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(searchValidatedFields));
    // if (searchValidatedFields.success) {
    //   //validation successful, build search objects
    //   //convert raw params into searchParam array
    //   searchFields = buildSearchParams(searchValidatedFields.data);
    //   c.d(JSON.stringify(searchFields));
    // }

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(pagerValidatedFields));
    const pager = getPagerWithDefaults(pagerValidatedFields.data);
    c.d(JSON.stringify(pager));

    //call service to retrieve data
    const customerService = container.get<ICustomerService>(TYPES.ICustomerService);
    const result = await customerService.customerFindMany(searchValidatedFields.data, pager, session.user);
    c.d(JSON.stringify(result));

    pager.records = result[1];
    pager.pages = Math.ceil(pager.records / pager.pageSize);
    return NextResponse.json({ data: {customers:result[0], pager: {...pager, records:result[1]}} }, { status: HttpStatusCode.Ok });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    else
      return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}


export async function POST(request: NextRequest) {
  try {
    c.fs("POST api/customers");
    c.i("Retrieving post body.")
    const body = await request.json();
    c.d(body);

    const session = await auth();
    if(!session?.user)
      throw new CustomError('Invalid session');

    c.i("Validating post data.");
    const validatedReservation = await customerValidator.safeParseAsync(body);

    if (!validatedReservation.success) {
      c.d("Reservation data is invalid. Return result.");
      c.d(validatedReservation.error.flatten().fieldErrors);
      return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
    }

    // update user
    c.i("Calling service.");
    const customerService = container.get<ICustomerService>(TYPES.ICustomerService);
    const createdCustomer = await customerService.customerCreate(validatedReservation.data as unknown as Customer, session.user);
    if (!createdCustomer) {
      c.d("Customer creation failed. Return result.");
      return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.ServerError });
    }

    c.i("Everything is fine. Return final result.");
    return NextResponse.json({ message: "Created", data: createdCustomer }, { status: HttpStatusCode.Created });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    else
      return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
  }
}
