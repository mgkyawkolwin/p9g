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
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import { getLocalDateString, getLocalDateTimeString, getUTCISODateString, getUTCISODateTimeString } from "@/lib/utils";
import c from "@/lib/core/logger/ConsoleLogger";
import { CONSTANTS, CurrencyList } from "@/lib/constants";


const CURRENCY: Map<string, string> = new Map(CurrencyList.map(cl => [cl, cl]));

const PREPAID_PACKAGES: Map<string, string> = new Map([
    ["NINETY_DAYS", "90 Days"]
]);

const PROMOTION_PACKAGES = new Map<string, string>([
    ["TWELVE_GUESTS", "12 Guests"],
    ["THIRTY_DAYS", "30 Days"]
]);

const TRANSPORTATION = new Map<string, string>([
    ["NOT_REQUIRED", "Not Required"],
    ["SHARED", "Shared"],
    ["PRIVATE", "Private"]
]);

export default function ReservationDetailForm() {
    c.i('Client > ReservationDetailForm');

    const [arrivalDateTime, setArrivalDateTime] = React.useState("");
    const [arrivalDateTimeUTC, setArrivalDateTimeUTC] = React.useState("");
    const [arrivalFlight, setArrivalFlight] = React.useState("");
    const [checkInDate, setCheckInDate] = React.useState("");
    const [checkInDateUTC, setCheckInDateUTC] = React.useState("");
    const [checkOutDate, setCheckOutDate] = React.useState("");
    const [checkOutDateUTC, setCheckOutDateUTC] = React.useState("");
    const [departureDateTime, setDepartureDateTime] = React.useState("");
    const [departureDateTimeUTC, setDepartureDateTimeUTC] = React.useState("");
    const [depertureFlight, setDepertureFlight] = React.useState("");
    const [depositAmount, setDepositAmount] = React.useState("0");
    const [depositCurrency, setDepositCurrency] = React.useState(CONSTANTS.DEFAULT_CURRENCY);
    const [dropOffType, setDropOffType] = React.useState("");
    const [noOfDays, setNoOfDays] = React.useState("0");
    const [noOfGuests, setNoOfGuests] = React.useState("0");
    const [pickUpType, setPickUpType] = React.useState("");
    const [prepaidPackage, setPrepaidPackage] = React.useState("");
    const [promotionPackage, setPromotionPackage] = React.useState("");
    const [roomNo, setRoomNo] = React.useState("");
    const [reservationType, setReservationType] = React.useState("GENERAL");
    const [remark, setRemark] = React.useState("");

    return (
        <div className="flex flex-col gap-2">
            <section aria-label="Reservation Detail" className="flex gap-2 flex-col w-full">
                <RadioGroup defaultValue={reservationType} onValueChange={setReservationType} name="reservationType">
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="GENERAL" id="r1" />
                        <Label htmlFor="r1">General</Label>
                    </div>
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="MEMBER" id="r2" />
                        <Label htmlFor="r2">Member</Label>
                    </div>
                    <div className="flex items-center gap-3">
                        <RadioGroupItem value="TOUR" id="r3" />
                        <Label htmlFor="r3">Tour</Label>
                    </div>
                </RadioGroup>
                <div className="flex gap-2">
                    <SelectWithLabel name="prepaidPackage" label="Prepaid Packages" size="sm" labelPosition="top" items={PREPAID_PACKAGES} defaultValue={prepaidPackage} />
                    <SelectWithLabel name="promotionPackage" label="Promotion Packages" size="sm" labelPosition="top" items={PROMOTION_PACKAGES} defaultValue={promotionPackage} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Check-in*" type="date" size={"sm"} labelPosition="top" defaultValue={checkInDate}
                    onChange={(e) => {console.log(e.target.value);
                        setCheckInDate(e.target.value); 
                        if(e.target.value)
                            setCheckInDateUTC(getUTCISODateString(e.target.value));
                        else
                            setCheckInDateUTC("");
                        }} />
                    <input type="hidden" name="checkInDateUTC" value={checkInDateUTC} />
                    <DateInputWithLabel label="Check-out*" type="date" size={"sm"} labelPosition="top" defaultValue={checkOutDate}
                    onChange={(e) => {console.log(e.target.value);
                        setCheckOutDate(e.target.value); 
                        if(e.target.value)
                            setCheckOutDateUTC(getUTCISODateTimeString(e.target.value));
                        else
                            setCheckOutDateUTC("");
                        }} />
                    <input type="hidden" name="checkOutDateUTC" value={checkOutDateUTC} />
                    <InputWithLabel name="noOfDays" label="No of Days*" size={"xs"} labelPosition="top" defaultValue={noOfDays} onBlur={(e) => setNoOfDays(e.target.value)} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Arrival Date" type={"datetime-local"} variant={"datetime"} size={"sm"} labelPosition="top" defaultValue={arrivalDateTime}
                    onChange={(e) => {console.log(e.target.value);
                        setArrivalDateTime(e.target.value); 
                        if(e.target.value)
                            setArrivalDateTimeUTC(getUTCISODateTimeString(e.target.value));
                        else
                            setArrivalDateTimeUTC("");
                        }} />
                    <input type="hidden" name="arrivalDateTimeUTC" value={arrivalDateTimeUTC} />
                    <InputWithLabel name="arrivalFlight" label="Arrival Flight" size={"xs"} labelPosition="top" 
                        defaultValue={arrivalFlight}  onBlur={(e) => setArrivalFlight(e.target.value)}/>
                    <SelectWithLabel name="pickUpType" label="Pick Up" size={"sm"} labelPosition="top" items={TRANSPORTATION} defaultValue={pickUpType} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Deperture Date" type="datetime-local" variant={"datetime"} size={"sm"} labelPosition="top" defaultValue={departureDateTime}
                    onChange={(e) => {console.log(e.target.value);
                        setDepartureDateTime(e.target.value); 
                        if(e.target.value)
                            setDepartureDateTimeUTC(getUTCISODateTimeString(e.target.value));
                        else
                            setDepartureDateTimeUTC("");
                        }} />
                    <input type="hidden" name="departureDateTimeUTC" value={departureDateTimeUTC} />
                    <InputWithLabel name="departureFlight" label="Deperture Flight" size={"xs"} labelPosition="top" 
                        defaultValue={depertureFlight}  onBlur={(e) => setDepertureFlight(e.target.value)}/>
                    <SelectWithLabel name="dropOffType" label="Drop Off" size={"sm"} labelPosition="top" items={TRANSPORTATION} defaultValue={dropOffType} />
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel name="noOfGuests" label="No of Guests" size={"xs"} labelPosition="top" 
                        defaultValue={noOfGuests}  onBlur={(e) => setNoOfGuests(e.target.value)}/>
                    <InputWithLabel name="roomNo" label="Room No" size={"xs"} labelPosition="top" 
                        defaultValue={roomNo} onBlur={(e) => setRoomNo(e.target.value)}/>
                    <Button size={"sm"}>Search Available Rooms</Button>
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel name="depositAmount" label="Deposit" size={"sm"} defaultValue={depositAmount} onBlur={(e) => setDepositAmount(e.target.value)} />
                    <SelectWithLabel name="depositCurrency" label="Currency" size={"sm"} labelPosition="top" items={CURRENCY} defaultValue={depositCurrency} />
                </div>
                <div className="flex gap-2">
                    <Textarea name="remark" placeholder="Remarks ..." defaultValue={remark} onBlur={(e) => setRemark(e.target.value)} />
                </div>
            </section>
        </div>
    );
};