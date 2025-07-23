import { NextResponse, NextRequest } from "next/server";
import { container } from "@/dicontainer";
import { TYPES, SearchParam } from "@/lib/types";
import c from "@/lib/core/logger/ConsoleLogger";
import { customerValidator, pagerValidator, searchSchema } from "@/lib/zodschema";
import { HttpStatusCode } from "@/lib/constants";
import { buildSearchParams, pagerWithDefaults } from "@/lib/utils";
import ICustomerService from "@/domain/services/contracts/ICustomerService";
import Customer from "@/domain/models/Customer";


export async function GET(request: NextRequest) {
  try{
    c.i("GET /api/customers");
    c.d(JSON.stringify(request));

    //retrieve search params from request
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    c.d(JSON.stringify(searchParams));

    //validate search params
    let searchFields : SearchParam[] = [];
    const searchValidatedFields = await searchSchema.safeParseAsync(searchParams);
    c.d(JSON.stringify(searchValidatedFields));
    if(searchValidatedFields.success){
      //validation successful, build search objects
      //convert raw params into searchParam array
      searchFields = buildSearchParams(searchValidatedFields.data);
      c.d(JSON.stringify(searchFields));
    }

    //no need to validate pager params, if not valid, will use defaults
    const pagerValidatedFields = await pagerValidator.safeParseAsync(searchParams);
    c.d(JSON.stringify(pagerValidatedFields));
    const pager = pagerWithDefaults(pagerValidatedFields.data);
    c.d(JSON.stringify(pager));

    //call service to retrieve data
    const customerService = container.get<ICustomerService>(TYPES.ICustomerService);
    const result = await customerService.customerFindMany(searchFields, pager);
    c.d(JSON.stringify(result));

    return NextResponse.json({data : result}, {status: 200});
  }catch(error){
    c.e(error instanceof Error ? error.message : String(error));
    return NextResponse.json(error, { status: HttpStatusCode.ServerError });
  }
}


export async function POST(request: NextRequest) {
    try{
        c.i("POST api/customers");
        c.i("Retrieving post body.")
        const body = await request.json();
        c.d(body);

        c.i("Validating post data.");
        const validatedReservation = await customerValidator.safeParseAsync(body);
        
        if(!validatedReservation.success){
            c.d("Reservation data is invalid. Return result.");
            c.d(validatedReservation.error.flatten().fieldErrors);
            return NextResponse.json({ message: "Invalid input." }, { status: HttpStatusCode.BadRequest });
        }

        // update user
        c.i("Calling service.");
        const customerService = container.get<ICustomerService>(TYPES.ICustomerService);
        const createdCustomer = await customerService.customerCreate(validatedReservation.data as unknown as Customer);
        if(!createdCustomer){
            c.d("Customer creation failed. Return result.");
            return NextResponse.json({ message: "Create failed." }, { status: HttpStatusCode.ServerError });
        }

        c.i("Everything is fine. Return final result.");
        return NextResponse.json({ message: "Created", data: createdCustomer }, { status: HttpStatusCode.Created });
    }catch(error){
        c.e(error instanceof Error ? error.message : String(error));
        return NextResponse.json({ message: "Unknow error occured." }, { status: HttpStatusCode.ServerError });
    }
}
