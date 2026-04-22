import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES, SearchParam } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { pagerValidator, invoiceValidator, searchValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import { getPagerWithDefaults } from "@/core/helpers";
import IInvoiceService from "@/core/services/contracts/IInvoiceService";
import Invoice from "@/core/models/domain/Invoice";
import { CustomError } from "@/lib/errors";
import { auth } from "@/app/auth";
import ILogService from "@/core/services/contracts/ILogService";


export async function GET(request: NextRequest) {
  try {
    c.fs("GET /api/invoices");
    c.d(JSON.stringify(request));

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;
    c.d(session.user);

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //validate search params
    const searchValidatedFields = await searchValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(searchValidatedFields));

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(pagerValidatedFields));
    const pager = getPagerWithDefaults(pagerValidatedFields.data);
    c.d(JSON.stringify(pager));

    //call service to retrieve data
    const invoiceService = container.get<IInvoiceService>(TYPES.IInvoiceService);
    const result = await invoiceService.invoiceGetList(searchValidatedFields.data, pager, session.user);
    
    pager.records = result[1];
    pager.pages = Math.ceil(pager.records / pager.pageSize);

    c.fe("GET /api/invoices");
    return NextResponse.json({ data: { invoices: result[0], pager: pager } }, { status: 200 });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    else
      return NextResponse.json({ message: "Unknown error occurred." }, { status: HttpStatusCode.ServerError });
  }
}


export async function POST(request: NextRequest) {
  try {
    c.fs("POST /api/invoices");
    c.i("Retrieving post body.")
    const body = await request.json();
    c.d(body);

    const session = await auth();
    c.d(session ? session.user : null)

    if (!request.headers.get('X-Resort-Location'))
      throw new CustomError('Location header is required', HttpStatusCode.BadRequest);
    session.user.location = request.headers.get('X-Resort-Location') || undefined;
    c.d(session.user);

    c.i("Validating post data.");
    const validatedInvoice = await invoiceValidator.safeParseAsync(body);

    if (!validatedInvoice.success) {
      c.d("Invoice data is invalid. Return result.");
      c.d(validatedInvoice.error.message);
      const msg = JSON.parse(validatedInvoice.error.message).map((e: any) => e.message).join(", ");
      return NextResponse.json({ message: `Validation failed. ${msg}` }, { status: HttpStatusCode.BadRequest });
    }

    // create invoice
    c.i("Calling service.");
    const invoiceService = container.get<IInvoiceService>(TYPES.IInvoiceService);
    const createdInvoice = await invoiceService.invoiceCreate(validatedInvoice.data as unknown as Invoice, session.user);
    if (!createdInvoice) {
      c.d("Invoice creation failed. Return result.");
      return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.ServerError });
    }

    c.fe("POST /api/invoices");
    return NextResponse.json({ message: "Created", data: createdInvoice }, { status: HttpStatusCode.Created });
  } catch (error) {
    c.e(error instanceof Error ? error.message : String(error));
    const logService = container.get<ILogService>(TYPES.ILogService);
    await logService.logError(error);
    if (error instanceof CustomError)
      return NextResponse.json({ message: error.message }, { status: error.statusCode });
    else
      return NextResponse.json({ message: "Unknown error occurred." }, { status: HttpStatusCode.ServerError });
  }
}
