
import * as React from "react";
import { SelectReservationStatus } from "../selects/selectreservationstatus";
import { SelectReservationType } from "../selects/selectreservationtype";
import { SelectPromotion } from "../selects/selectpromotion";
import { InputDateRange } from "../uicustom/inputdaterange";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { DatePickerCustomWithLabel } from "../uicustom/datepickercustomwithlabel";
import { Button } from "../ui/button";

export default function CustomerSearch(){

    return (
        <section aria-label="CheckIn Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <DatePickerCustomWithLabel label="Date" />
                <InputWithLabel label="Guest Name" />
                <InputWithLabel label="National ID" />
                <InputWithLabel label="Passport" />
                <InputWithLabel label="Phone" />
                <Button>Search</Button>
            </div>
        </section>
    );
}
