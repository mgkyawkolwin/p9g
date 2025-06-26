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


export default function ReservationDetailForm() {

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
                    <SelectWithLabel label="Prepaid Packages" size="sm" labelPosition="top" />
                    <SelectWithLabel label="Prepaid Packages" size="sm" labelPosition="top" />
                </div>
                <div className="flex gap-2">
                    <DatePickerCustomWithLabel label="Check-in*" size={"sm"} labelPosition="top" />
                    <DatePickerCustomWithLabel label="Check-out*" size={"sm"} labelPosition="top"/>
                    <InputWithLabel label="No of Days*" size={"xs"} labelPosition="top"/>
                </div>
                <div className="flex gap-2">
                    <DatePickerCustomWithLabel label="Arrival Date" size={"sm"} labelPosition="top"/>
                    <InputWithLabel label="Arrival Flight" size={"xs"} labelPosition="top"/>
                    <SelectWithLabel label="Pick Up" size={"sm"} labelPosition="top"/>
                </div>
                <div className="flex gap-2">
                    <DatePickerCustomWithLabel label="Deperture Date" size={"sm"} labelPosition="top"/>
                    <InputWithLabel label="Deperture Flight" size={"xs"} labelPosition="top"/>
                    <SelectWithLabel label="Drop Off" size={"sm"} labelPosition="top"/>
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel label="No of Guests" size={"xs"} labelPosition="top"/>
                    <InputWithLabel label="Room No" size={"xs"} labelPosition="top"/>
                    <Button size={"sm"}>Search Available Rooms</Button>
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel label="No of Guests" size={"xs"} labelPosition="top"/>
                    <InputWithLabel label="Deposit" size={"sm"} />
                </div>
                <div className="flex gap-2">
                    <Textarea placeholder="Remarks ..."/>
                </div>
            </section>
        </div>
    );
};