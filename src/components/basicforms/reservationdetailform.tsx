'use client';

import { Label } from "@/components/ui/label"
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"
import { SelectWithLabel } from "../uicustom/selectwithlabel";
import { DatePickerCustomWithLabel } from "../uicustom/datepickercustomwithlabel";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import React from "react";

const PREPAID_PACKAGES: Map<string, string> = new Map([
    ["NINETY_DAYS", "90 Days"]
]);

const PROMOTION_PACKAGES = new Map<string, string>([
    ["TWELVE_PEOPLE", "12 Guests"],
    ["THIRTY_DAYS", "30 Days"]
]);

export default function ReservationDetailForm() {

    const [arrivalFlight, setArrivalFlight] = React.useState("");
    const [depertureFlight, setDepertureFlight] = React.useState("");
    const [noOfGuests, setNoOfGuests] = React.useState("0");
    const [roomNo, setRoomNo] = React.useState("");

    return (
        <div className="flex flex-col gap-2">
            <section aria-label="Reservation Detail" className="flex gap-2 flex-col w-full">
                <RadioGroup defaultValue="comfortable">
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="default" id="r1" />
                        <Label htmlFor="r1">General</Label>
                    </div>
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="comfortable" id="r2" />
                        <Label htmlFor="r2">Member</Label>
                    </div>
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="compact" id="r3" />
                        <Label htmlFor="r3">Tour</Label>
                    </div>
                </RadioGroup>
                <div className="flex gap-2">
                    <SelectWithLabel label="Prepaid Packages" size="sm" labelPosition="top" items={PREPAID_PACKAGES} />
                    <SelectWithLabel label="Promotion Packages" size="sm" labelPosition="top" items={PROMOTION_PACKAGES} />
                </div>
                <div className="flex gap-2">
                    <DatePickerCustomWithLabel label="Check-in*" size={"sm"} labelPosition="top" />
                    <DatePickerCustomWithLabel label="Check-out*" size={"sm"} labelPosition="top" />
                    <InputWithLabel label="No of Days*" size={"xs"} labelPosition="top" />
                </div>
                <div className="flex gap-2">
                    <DatePickerCustomWithLabel label="Arrival Date" size={"sm"} labelPosition="top" />
                    <InputWithLabel label="Arrival Flight" size={"xs"} labelPosition="top" 
                        defaultValue={arrivalFlight}  onBlur={(e) => setArrivalFlight(e.target.value)}/>
                    <SelectWithLabel label="Pick Up" size={"sm"} labelPosition="top" />
                </div>
                <div className="flex gap-2">
                    <DatePickerCustomWithLabel label="Deperture Date" size={"sm"} labelPosition="top" />
                    <InputWithLabel label="Deperture Flight" size={"xs"} labelPosition="top" 
                        defaultValue={depertureFlight}  onBlur={(e) => setDepertureFlight(e.target.value)}/>
                    <SelectWithLabel label="Drop Off" size={"sm"} labelPosition="top" />
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel label="No of Guests" size={"xs"} labelPosition="top" 
                        defaultValue={noOfGuests}  onBlur={(e) => setNoOfGuests(e.target.value)}/>
                    <InputWithLabel label="Room No" size={"xs"} labelPosition="top" 
                        defaultValue={roomNo} onBlur={(e) => setRoomNo(e.target.value)}/>
                    <Button size={"sm"}>Search Available Rooms</Button>
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel label="Deposit" size={"sm"} />
                </div>
                <div className="flex gap-2">
                    <Textarea placeholder="Remarks ..." />
                </div>
            </section>
        </div>
    );
};