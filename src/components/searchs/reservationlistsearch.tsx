
import * as React from "react";
import { SelectReservationStatus } from "../selects/selectreservationstatus";
import { SelectReservationType } from "../selects/selectreservationtype";
import { SelectPromotion } from "../selects/selectpromotion";
import { InputDateRange } from "../uicustom/inputdaterange";
import { InputWithLabel } from "../uicustom/inputwithlabel";

export default function ReservationListSearch(){

    return (
        <section aria-label="Reservatoin List Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <SelectReservationStatus />
                <SelectReservationType />
                <SelectPromotion />
            </div>
            <div className="flex gap-4">
                <InputDateRange />
                <InputWithLabel label="Guest Name" />
                <InputWithLabel label="Reservation ID" />
            </div>
        </section>
    );
}
