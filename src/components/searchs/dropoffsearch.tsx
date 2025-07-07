
import * as React from "react";
import { SelectReservationStatus } from "../selects/selectreservationstatus";
import { SelectReservationType } from "../selects/selectreservationtype";
import { SelectPromotion } from "../selects/selectpromotion";
import { InputDateRange } from "../uicustom/inputdaterange";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { DatePickerCustomWithLabel } from "../uicustom/datepickercustomwithlabel";
import { Button } from "../ui/button";

export default function DropOffSearch(){

    return (
        <section aria-label="CheckIn Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <DatePickerCustomWithLabel label="Date" />
                <InputWithLabel label="Vehicle No" />
                <InputWithLabel label="Car Sharing" />
                <InputWithLabel label="Airport" />
                <Button>Search</Button>
                <Button variant={"outline"}>Print</Button>
                <Button variant={"secondary"}>Save All</Button>
            </div>
        </section>
    );
}
