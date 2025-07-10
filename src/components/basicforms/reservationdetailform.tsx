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
import Reservation from "@/domain/models/Reservation";


const initialState = {
    arrivalDateTime: "01-01-2028",
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
    depositDate: "",
    depositDateUTC: "",
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

export default React.forwardRef<ReservationDetailFormInterface, {initialReservation?: typeof initialState}>(
    function ReservationDetailForm(props,ref) {
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

    

    const [reservation, setReservation] = React.useState(props.initialReservation ?? initialState);

    React.useImperativeHandle(ref, () => ({
        resetForm: () => {
          setReservation(initialState);
        }
      }));

    React.useEffect(() => {
        if(props.initialReservation)
            setReservation(props.initialReservation);
    }, [props.initialReservation]);

    return (
        <div className="flex flex-col gap-2">
            <section aria-label="Reservation Detail" className="flex gap-2 flex-col w-full">
                <RadioGroup defaultValue={reservation.reservationType} onValueChange={(value) => setReservation({...reservation, reservationType: value})} name="reservationType">
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
                    <SelectWithLabel name="reservationStatus" label="Reservation Status" size="sm" labelPosition="top" items={SelectList.RESERVATION_STATUS} defaultValue={reservation.reservationStatus}  value={reservation.reservationStatus} 
                         />
                    <SelectWithLabel name="prepaidPackage" label="Prepaid Packages" size="sm" labelPosition="top" items={SelectList.PREPAID_PACKAGES} value={reservation.prepaidPackage} 
                        onValueChange={value => setReservation(prev => ({...prev, reservationStatus: value}))} />
                    <SelectWithLabel name="promotionPackage" label="Promotion Packages" size="sm" labelPosition="top" items={SelectList.PROMOTION_PACKAGES} value={reservation.promotionPackage} 
                        onValueChange={value => setReservation(prev => ({...prev, reservationStatus: value}))} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Check-in*" type="date" size={"sm"} labelPosition="top" defaultValue={reservation.checkInDateUTC ? new Date(reservation.checkInDateUTC).toLocaleDateString('sv-SE') : ''}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        setReservation(prev => ({
                            ...prev,
                            checkInDate: newDate,
                            checkInDateUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="checkInDateUTC" value={reservation.checkInDateUTC} />
                    <DateInputWithLabel label="Check-out*" type="date" size={"sm"} labelPosition="top" defaultValue={reservation.checkOutDateUTC ? new Date(reservation.checkOutDateUTC).toLocaleDateString('sv-SE') : ''}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        setReservation(prev => ({
                            ...prev,
                            checkOutDate: newDate,
                            checkOutDateUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="checkOutDateUTC" value={reservation.checkOutDateUTC} />
                    <InputWithLabel name="noOfDays" label="No of Days*" size={"xs"} labelPosition="top" defaultValue={reservation.noOfDays} onBlur={(e) => setReservation({...reservation, noOfDays: e.target.value})} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Arrival Date" type={"datetime-local"} variant={"datetime"} size={"sm"} labelPosition="top" defaultValue={reservation.arrivalDateTimeUTC ? new Date(reservation.arrivalDateTimeUTC).toLocaleString('sv-SE') : ''}
                    onChange={(e) => {console.log(e.target.value);
                        const newDate = e.target.value;
                        setReservation(prev => ({
                            ...prev,
                            arrivalDateTime: newDate,
                            arrivalDateTimeUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="arrivalDateTimeUTC" value={reservation.arrivalDateTimeUTC} />
                    <InputWithLabel name="arrivalFlight" label="Arrival Flight" size={"xs"} labelPosition="top" 
                        defaultValue={reservation.arrivalFlight}  onBlur={(e) => setReservation({...reservation, arrivalFlight: e.target.value})}/>
                    <SelectWithLabel name="pickUpType" label="Pick Up" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION} defaultValue={reservation.pickUpType} />
                </div>
                <div className="flex gap-2">
                    <DateInputWithLabel label="Deperture Date" type="datetime-local" variant={"datetime"} size={"sm"} labelPosition="top" defaultValue={reservation.departureDateTimeUTC  ? new Date(reservation.departureDateTimeUTC).toLocaleString('sv-SE') : ''}
                    onChange={(e) => {console.log(e.target.value);
                        const newDate = e.target.value;
                        setReservation(prev => ({
                            ...prev,
                            departureDateTime: newDate,
                            departureDateTimeUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="departureDateTimeUTC" value={reservation.departureDateTimeUTC} />
                    <InputWithLabel name="departureFlight" label="Deperture Flight" size={"xs"} labelPosition="top" 
                        defaultValue={reservation.departureFlight}  onBlur={(e) => setReservation({...reservation, departureFlight: e.target.value})}/>
                    <SelectWithLabel name="dropOffType" label="Drop Off" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION} defaultValue={reservation.dropOffType} />
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel name="noOfGuests" label="No of Guests" size={"xs"} labelPosition="top" 
                        defaultValue={reservation.noOfGuests}  onBlur={(e) => setReservation({...reservation, noOfGuests: e.target.value})}/>
                    <InputWithLabel name="roomNo" label="Room No" size={"xs"} labelPosition="top" 
                        defaultValue={reservation.roomNo} onBlur={(e) => setReservation({...reservation, roomNo: e.target.value})}/>
                    {/* <Button size={"sm"}>Search Available Rooms</Button> */}
                </div>
                <div className="flex gap-2 items-end">
                    <InputWithLabel name="depositAmount" label="Deposit" size={"sm"} labelPosition="top" defaultValue={reservation.depositAmount} onBlur={(e) => setReservation({...reservation, depositAmount: e.target.value})} />
                    <SelectWithLabel name="depositCurrency" label="Currency" size={"sm"} labelPosition="top" items={SelectList.CURRENCY} defaultValue={reservation.depositCurrency} />
                    <DateInputWithLabel label="Deposit Date" type="date" size={"sm"} labelPosition="top" defaultValue={reservation.depositDateUTC ? new Date(reservation.depositDateUTC).toLocaleDateString('sv-SE') : ''}
                    onChange={(e) => {
                        const newDate = e.target.value;
                        setReservation(prev => ({
                            ...prev,
                            depositDate: newDate,
                            depositDateUTC: newDate ? getUTCISODateString(newDate) : ''
                        }));
                        }} />
                    <input type="hidden" name="depositDateUTC" value={reservation.depositDateUTC ?? ''} />
                </div>
                <div className="flex gap-2">
                    <Textarea name="remark" placeholder="Remarks ..." value={reservation.remark ?? ''} onChange={(e) => setReservation({...reservation, remark: e.target.value})} />
                </div>
            </section>
        </div>
    );
}
);