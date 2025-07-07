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
import { CONSTANTS, CurrencyList, SelectList } from "@/lib/constants";


const initialState = {
    arrivalDateTime: "",
    arrivalDateTimeUTC: "",
    arrivalFlight: "",
    checkInDate: "",
    checkInDateUTC: "",
    checkOutDate: "",
    checkOutDateUTC: "",
    departureDateTime: "",
    departureDateTimeUTC: "",
    departureFlight: "",
    depositAmount: "0",
    depositCurrency: CONSTANTS.DEFAULT_CURRENCY,
    dropOffType: "",
    noOfDays: "0",
    noOfGuests: "0",
    pickUpType: "",
    prepaidPackage: "",
    promotionPackage: "",
    roomNo: "",
    reservationStatus: "NEW",
    reservationType: "GENERAL",
    remark: ""
};

interface ReservationDetailFormInterface {
    resetForm: () => void;
}

export default React.forwardRef<ReservationDetailFormInterface>(function ReservationDetailForm(props,ref) {
    c.i('Client > ReservationDetailForm');

    // const [arrivalDateTime, setArrivalDateTime] = React.useState("");
    // const [arrivalDateTimeUTC, setArrivalDateTimeUTC] = React.useState("");
    // const [arrivalFlight, setArrivalFlight] = React.useState("");
    // const [checkInDate, setCheckInDate] = React.useState("");
    // const [checkInDateUTC, setCheckInDateUTC] = React.useState("");
    // const [checkOutDate, setCheckOutDate] = React.useState("");
    // const [checkOutDateUTC, setCheckOutDateUTC] = React.useState("");
    // const [departureDateTime, setDepartureDateTime] = React.useState("");
    // const [departureDateTimeUTC, setDepartureDateTimeUTC] = React.useState("");
    // const [depertureFlight, setDepertureFlight] = React.useState("");
    // const [depositAmount, setDepositAmount] = React.useState("0");
    // const [depositCurrency, setDepositCurrency] = React.useState(CONSTANTS.DEFAULT_CURRENCY);
    // const [dropOffType, setDropOffType] = React.useState("");
    // const [noOfDays, setNoOfDays] = React.useState("0");
    // const [noOfGuests, setNoOfGuests] = React.useState("0");
    // const [pickUpType, setPickUpType] = React.useState("");
    // const [prepaidPackage, setPrepaidPackage] = React.useState("");
    // const [promotionPackage, setPromotionPackage] = React.useState("");
    // const [roomNo, setRoomNo] = React.useState("");
    // const [reservationType, setReservationType] = React.useState("GENERAL");
    // const [remark, setRemark] = React.useState("");

    

    const [formData, setFormData] = React.useState(initialState);

    React.useImperativeHandle(ref, () => ({
        resetForm: () => {
          setFormData(initialState);
        }
      }));

    return (
        <div className="flex flex-col gap-2">
            <section aria-label="Reservation Detail" className="flex gap-2 flex-col w-full">
                <RadioGroup defaultValue={formData.reservationType} onValueChange={(value) => setFormData({...formData, reservationType: value})} name="reservationType">
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
                    <SelectWithLabel name="reservationStatus" label="Reservation Status" size="sm" labelPosition="top" items={SelectList.RESERVATION_STATUS} defaultValue={formData.reservationStatus} />
                    <SelectWithLabel name="prepaidPackage" label="Prepaid Packages" size="sm" labelPosition="top" items={SelectList.PREPAID_PACKAGES} defaultValue={formData.prepaidPackage} />
                    <SelectWithLabel name="promotionPackage" label="Promotion Packages" size="sm" labelPosition="top" items={SelectList.PROMOTION_PACKAGES} defaultValue={formData.promotionPackage} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Check-in*" type="date" size={"sm"} labelPosition="top" defaultValue={formData.checkInDate}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        setFormData(prev => ({
                            ...prev,
                            checkInDate: newDate,
                            checkInDateUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="checkInDateUTC" value={formData.checkInDateUTC} />
                    <DateInputWithLabel label="Check-out*" type="date" size={"sm"} labelPosition="top" defaultValue={formData.checkOutDate}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        setFormData(prev => ({
                            ...prev,
                            checkOutDate: newDate,
                            checkOutDateUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="checkOutDateUTC" value={formData.checkOutDateUTC} />
                    <InputWithLabel name="noOfDays" label="No of Days*" size={"xs"} labelPosition="top" defaultValue={formData.noOfDays} onBlur={(e) => setFormData({...formData, noOfDays: e.target.value})} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Arrival Date" type={"datetime-local"} variant={"datetime"} size={"sm"} labelPosition="top" defaultValue={formData.arrivalDateTime}
                    onChange={(e) => {console.log(e.target.value);
                        const newDate = e.target.value;
                        setFormData(prev => ({
                            ...prev,
                            arrivalDateTime: newDate,
                            arrivalDateTimeUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="arrivalDateTimeUTC" value={formData.arrivalDateTimeUTC} />
                    <InputWithLabel name="arrivalFlight" label="Arrival Flight" size={"xs"} labelPosition="top" 
                        defaultValue={formData.arrivalFlight}  onBlur={(e) => setFormData({...formData, arrivalFlight: e.target.value})}/>
                    <SelectWithLabel name="pickUpType" label="Pick Up" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION} defaultValue={formData.pickUpType} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Deperture Date" type="datetime-local" variant={"datetime"} size={"sm"} labelPosition="top" defaultValue={formData.departureDateTime}
                    onChange={(e) => {console.log(e.target.value);
                        const newDate = e.target.value;
                        setFormData(prev => ({
                            ...prev,
                            departureDateTime: newDate,
                            departureDateTimeUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="departureDateTimeUTC" value={formData.departureDateTimeUTC} />
                    <InputWithLabel name="departureFlight" label="Deperture Flight" size={"xs"} labelPosition="top" 
                        defaultValue={formData.departureFlight}  onBlur={(e) => setFormData({...formData, departureFlight: e.target.value})}/>
                    <SelectWithLabel name="dropOffType" label="Drop Off" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION} defaultValue={formData.dropOffType} />
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel name="noOfGuests" label="No of Guests" size={"xs"} labelPosition="top" 
                        defaultValue={formData.noOfGuests}  onBlur={(e) => setFormData({...formData, noOfGuests: e.target.value})}/>
                    <InputWithLabel name="roomNo" label="Room No" size={"xs"} labelPosition="top" 
                        defaultValue={formData.roomNo} onBlur={(e) => setFormData({...formData, roomNo: e.target.value})}/>
                    {/* <Button size={"sm"}>Search Available Rooms</Button> */}
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel name="depositAmount" label="Deposit" size={"sm"} defaultValue={formData.depositAmount} onBlur={(e) => setFormData({...formData, depositAmount: e.target.value})} />
                    <SelectWithLabel name="depositCurrency" label="Currency" size={"sm"} labelPosition="top" items={SelectList.CURRENCY} defaultValue={formData.depositCurrency} />
                </div>
                <div className="flex gap-2">
                    <Textarea name="remark" placeholder="Remarks ..." defaultValue={formData.remark} onBlur={(e) => setFormData({...formData, remark: e.target.value})} />
                </div>
            </section>
        </div>
    );
}
);