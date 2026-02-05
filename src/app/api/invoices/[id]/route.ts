import { NextResponse, NextRequest } from "next/server";
import { container } from "@/core/di/dicontainer";
import { TYPES } from "@/core/types";
import c from "@/lib/loggers/console/ConsoleLogger";
import { invoiceValidator } from "@/core/validators/zodschema";
import { HttpStatusCode } from "@/core/constants";
import IInvoiceService from "@/core/services/contracts/IInvoiceService";
import Invoice from "@/core/models/domain/Invoice";
import { CustomError } from "@/lib/errors";
import { auth } from "@/app/auth";
import ILogService from "@/core/services/contracts/ILogService";


export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("GET /api/invoices/[id]");
    const { id } = await context.params;
    c.d(`Invoice ID: ${id}`);

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    //call service to retrieve data
    const invoiceService = container.get<IInvoiceService>(TYPES.IInvoiceService);
    const invoice = await invoiceService.invoiceGetById(id, session.user);
    
    if (!invoice) {
      c.d("Invoice not found.");
      return NextResponse.json({ message: "Invoice not found." }, { status: HttpStatusCode.NotFound });
    }

    c.fe("GET /api/invoices/[id]");
    return NextResponse.json({ data: invoice }, { status: 200 });
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


export async function PATCH(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PATCH /api/invoices/[id]");
    const { id } = await context.params;
    c.d(`Invoice ID: ${id}`);

    const body = await request.json();
    c.d(body);

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    c.i("Validating patch data.");
    const validatedInvoice = await invoiceValidator.safeParseAsync(body);

    if (!validatedInvoice.success) {
      c.d("Invoice data is invalid.");
      c.d(validatedInvoice.error.flatten());
      return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.BadRequest });
    }

    // patch invoice
    c.i("Calling service.");
    const invoiceService = container.get<IInvoiceService>(TYPES.IInvoiceService);

    // If items are present in the payload, delegate to the full update handler
    // which handles inserts/updates/deletes for related invoice items.
    if ((validatedInvoice.data.simpleItems && validatedInvoice.data.simpleItems.length > 0) ||
        (validatedInvoice.data.bookingItems && validatedInvoice.data.bookingItems.length > 0)) {
      c.i("Detected items arrays in PATCH request; using full update to handle items.");
      await invoiceService.invoiceUpdate(id, validatedInvoice.data as unknown as Invoice, session.user);
    } else {
      await invoiceService.invoicePatch(id, validatedInvoice.data as unknown as Invoice, session.user);
    }

    c.fe("PATCH /api/invoices/[id]");
    return NextResponse.json({ message: "Updated" }, { status: 200 });
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


export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("PUT /api/invoices/[id]");
    const { id } = await context.params;
    c.d(`Invoice ID: ${id}`);

    const body = await request.json();
    c.d(body);

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    c.i("Validating put data.");
    const validatedInvoice = await invoiceValidator.safeParseAsync(body);

    if (!validatedInvoice.success) {
      c.d("Invoice data is invalid.");
      c.d(validatedInvoice.error.flatten());
      return NextResponse.json({ message: "Update failed." }, { status: HttpStatusCode.BadRequest });
    }

    // update invoice
    c.i("Calling service.");
    const invoiceService = container.get<IInvoiceService>(TYPES.IInvoiceService);
    await invoiceService.invoiceUpdate(id, validatedInvoice.data as unknown as Invoice, session.user);

    c.fe("PUT /api/invoices/[id]");
    return NextResponse.json({ message: "Updated" }, { status: 200 });
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


export async function DELETE(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    c.fs("DELETE /api/invoices/[id]");
    const { id } = await context.params;
    c.d(`Invoice ID: ${id}`);

    const session = await auth();
    if (!session?.user)
      throw new CustomError('Invalid session');

    // delete invoice
    c.i("Calling service.");
    const invoiceService = container.get<IInvoiceService>(TYPES.IInvoiceService);
    await invoiceService.invoiceDelete(id, session.user);

    c.fe("DELETE /api/invoices/[id]");
    return NextResponse.json({ message: "Deleted" }, { status: 200 });
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
