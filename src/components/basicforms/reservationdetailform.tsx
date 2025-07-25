'use client';

import { Label } from "@/components/ui/label"
import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group"
import { SelectWithLabel } from "../uicustom/selectwithlabel";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { Textarea } from "../ui/textarea";
import React from "react";
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import { calculateDayDifference, getUTCISODateString } from "@/lib/utils";
import c from "@/lib/core/logger/ConsoleLogger";
import { SelectList } from "@/lib/constants";
import Reservation from "@/domain/models/Reservation";
import { Checkbox } from "../ui/checkbox";
import { InputCustom } from "../uicustom/inputcustom";



interface ReservationDetailFormInterface {
    resetForm: () => void;
}

export default React.forwardRef<ReservationDetailFormInterface, { initialReservation: Reservation }>(
    function ReservationDetailForm(props, ref) {
        c.i('Client > ReservationDetailForm');


        const [reservation, setReservation] = React.useState(props.initialReservation);

        React.useImperativeHandle(ref, () => ({
            resetForm: () => {
                setReservation(new Reservation());
            }
        }));

        React.useEffect(() => {
            if (props.initialReservation)
                setReservation(props.initialReservation);
        }, [props.initialReservation]);

        return (
            <div className="flex flex-col gap-2">
                <section aria-label="Reservation Detail" className="flex gap-2 flex-col w-full">
                    <RadioGroup value={reservation?.reservationType} onValueChange={(value) => setReservation(prev => ({...prev, reservationType: value}))} name="reservationType">
                        <div className="flex gap-4">
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="GENERAL" id="r1" />
                            <Label htmlFor="r1">General</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="MEMBER" id="r2" />
                            <Label htmlFor="r2">Member</Label>
                        </div>
                        <div className="flex items-center gap-2">
                            <RadioGroupItem value="TOUR" id="r3" />
                            <Label htmlFor="r3">Tour</Label>
                            <InputCustom />
                        </div>
                        </div>
                    </RadioGroup>
                    <div className="flex gap-2">
                        <SelectWithLabel name="reservationStatus" label="Reservation Status" size="sm" labelPosition="top" items={SelectList.RESERVATION_STATUS} 
                        value={reservation?.reservationStatus} onValueChange={value => setReservation(prev => ({...prev, reservationStatus: value}))}
                        />
                        <SelectWithLabel name="prepaidPackage" label="Prepaid Packages" size="sm" labelPosition="top" items={SelectList.PREPAID_PACKAGES} value={reservation?.prepaidPackage}
                            onValueChange={value => setReservation(prev => ({ ...prev, reservationStatusValue: value }))} />
                        <SelectWithLabel name="promotionPackage" label="Promotion Packages" size="sm" labelPosition="top" items={SelectList.PROMOTION_PACKAGES} value={reservation?.promotionPackage}
                            onValueChange={value => setReservation(prev => ({ ...prev, reservationStatusValue: value }))} />
                    </div>
                    <div className="flex gap-2">
                        <DateInputWithLabel name="checkInDateUTC" label="Check-in*" type="date" size={"sm"} labelPosition="top" value={reservation?.checkInDateUTC ? new Date(reservation?.checkInDateUTC).toLocaleDateString('sv-SE') : ''}
                            onChange={(e) => {
                                const newDate = e.target.value ? new Date(new Date(e.target.value).toISOString()) : undefined;
                                if(newDate && reservation?.checkOutDateUTC){
                                    const days = calculateDayDifference(newDate, reservation.checkOutDateUTC);
                                    setReservation(prev => ({...prev, noOfDays: days}));
                                }
                                setReservation(prev => ({
                                    ...prev,
                                    checkInDateUTC: newDate
                                }));
                            }} />
                        <DateInputWithLabel name="checkOutDateUTC"  label="Check-out*" type="date" size={"sm"} labelPosition="top" value={reservation?.checkOutDateUTC ? new Date(reservation?.checkOutDateUTC).toLocaleDateString('sv-SE') : ''}
                            onChange={(e) => {
                                const newDate = e.target.value ? new Date(new Date(e.target.value).toISOString()) : undefined;
                                if(newDate && reservation?.checkInDateUTC){
                                    const days = calculateDayDifference(reservation.checkInDateUTC, newDate);
                                    setReservation(prev => ({...prev, noOfDays: days}));
                                }
                                setReservation(prev => ({
                                    ...prev,
                                    checkOutDateUTC: newDate
                                }));
                            }} />
                        <InputWithLabel name="noOfDays" label="No of Days*" size={"xs"} labelPosition="top" value={reservation?.noOfDays} onChange={(e) => setReservation(prev => ({...prev, noOfDays: Number(e.target.value)}))} />
                    </div>
                    <div className="flex gap-2">
                        <DateInputWithLabel name="arrivalDateTimeUTC" label="Arrival Date" type={"datetime-local"} variant={"datetime"} size={"sm"} labelPosition="top" 
                        value={reservation?.arrivalDateTimeUTC ? new Date(reservation?.arrivalDateTimeUTC).toLocaleString('sv-SE') : ''}
                            onChange={(e) => {
                                console.log(e.target.value);
                                const newDate = e.target.value ? new Date(new Date(e.target.value).toISOString()) : undefined;
                                setReservation(prev => ({
                                    ...prev,
                                    arrivalDateTimeUTC: newDate
                                }));
                            }} />
                        <InputWithLabel name="arrivalFlight" label="Arrival Flight" size={"xs"} labelPosition="top"
                            value={reservation?.arrivalFlight} onChange={(e) => setReservation(prev => ({...prev, arrivalFlight: e.target.value}))} />
                        <SelectWithLabel name="pickUpType" label="Pick Up" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION} 
                        value={reservation?.pickUpType} onValueChange={value => setReservation(prev => ({...prev, pickUpType: value}))} />
                    </div>
                    <div className="flex gap-2">
                        <DateInputWithLabel name="departureDateTimeUTC" label="Deperture Date" type="datetime-local" variant={"datetime"} size={"sm"} labelPosition="top" 
                        value={reservation?.departureDateTimeUTC ? new Date(reservation?.departureDateTimeUTC).toLocaleString('sv-SE') : ''}
                            onChange={(e) => {
                                console.log(e.target.value);
                                const newDate = e.target.value ? new Date(new Date(e.target.value).toISOString()) : undefined;
                                setReservation(prev => ({
                                    ...prev,
                                    departureDateTimeUTC: newDate
                                }));
                            }} />
                        <InputWithLabel name="departureFlight" label="Deperture Flight" size={"xs"} labelPosition="top"
                            value={reservation?.departureFlight} onChange={(e) => setReservation(prev => ({...prev, departureFlight: e.target.value}))} />
                        <SelectWithLabel name="dropOffType" label="Drop Off" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION} 
                        value={reservation?.dropOffType} onValueChange={value => setReservation(prev => ({...prev, dropOffType: value}))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <InputWithLabel name="noOfGuests" label="No of Guests" size={"xs"} labelPosition="top"
                            value={reservation?.noOfGuests} onChange={(e) => setReservation(prev => ({...prev, noOfGuests: Number(e.target.value)}))} />
                        <InputWithLabel name="roomNo" label="Room No" size={"xs"} labelPosition="top"
                            value={reservation?.roomNo} onChange={(e) => setReservation(prev => ({...prev, roomNo: e.target.value}))} />
                        <Checkbox /> Single Occupancy
                        {/* <Button size={"sm"}>Search Available Rooms</Button> */}
                    </div>
                    {/* <div className="flex gap-2 items-end">
                        <InputWithLabel name="depositAmount" label="Deposit" size={"sm"} labelPosition="top" 
                        value={reservation?.depositAmount} onChange={(e) => setReservation(prev => ({...prev, depositAmount: Number(e.target.value)}))} />
                        <SelectWithLabel name="depositCurrency" label="Currency" size={"sm"} labelPosition="top" items={SelectList.CURRENCY} 
                        value={reservation?.depositCurrency} onValueChange={(value) => setReservation(prev => ({...prev, depositCurrency: value}))} />
                        <DateInputWithLabel label="Deposit Date" type="date" size={"sm"} labelPosition="top" 
                        value={reservation?.depositDateUTC ? new Date(reservation?.depositDateUTC).toLocaleDateString('sv-SE') : ''}
                            onChange={(e) => {
                                const newDate = e.target.value ? new Date(new Date(e.target.value).toISOString()) : undefined;
                                setReservation(prev => ({
                                    ...prev,
                                    depositDateUTC: newDate
                                }));
                            }} />
                    </div> */}
                    {/* <div className="flex gap-2 items-end">
                        <InputWithLabel name="pickUpFee" label="Pick-Up Fee" size={"sm"} labelPosition="top" 
                        value={reservation?.pickUpFee} onChange={(e) => setReservation(prev => ({...prev, pickUpFee: Number(e.target.value)}))} />
                        <SelectWithLabel name="pickUpFeeCurrency" label="Currency" size={"sm"} labelPosition="top" items={SelectList.CURRENCY} 
                        value={reservation?.pickUpFeeCurrency} onValueChange={(value) => setReservation(prev => ({...prev, pickUpFeeCurrency: value}))} />
                        <DateInputWithLabel label="Deposit Date" type="date" size={"sm"} labelPosition="top" 
                        value={reservation?.pickUpFeePaidOnUTC ? reservation?.pickUpFeePaidOnUTC.toLocaleDateString('sv-SE') : ''}
                            onChange={(e) => {
                                const newDate = e.target.value ? new Date(new Date(e.target.value).toISOString()) : undefined;
                                setReservation(prev => ({
                                    ...prev,
                                    pickUpFeePaidOnUTC: newDate
                                }));
                            }} />
                    </div> */}
                    {/* <div className="flex gap-2 items-end">
                        <InputWithLabel name="dropOfFee" label="Drop-Off Fee" size={"sm"} labelPosition="top" 
                        value={reservation?.dropOfFee} onChange={(e) => setReservation(prev => ({...prev, dropOfFee: Number(e.target.value)}))} />
                        <SelectWithLabel name="dropOffFeeCurrency" label="Currency" size={"sm"} labelPosition="top" items={SelectList.CURRENCY} 
                        value={reservation?.dropOffFeeCurrency} onValueChange={(value) => setReservation(prev => ({...prev, dropOffFeeCurrency: value}))} />
                        <DateInputWithLabel label="Deposit Date" type="date" size={"sm"} labelPosition="top" 
                        value={reservation?.dropOffFeePaidOnUTC ? reservation?.depositDateUTC.toLocaleDateString('sv-SE') : ''}
                            onChange={(e) => {
                                const newDate = e.target.value ? new Date(new Date(e.target.value).toISOString()) : undefined;
                                setReservation(prev => ({
                                    ...prev,
                                    dropOffFeePaidOnUTC: newDate
                                }));
                            }} />
                    </div> */}
                    <div className="flex gap-2 items-end">
                        <InputWithLabel name="tax" label="Tax (%)" size={"sm"} labelPosition="top" 
                        value={reservation?.tax} onChange={(e) => setReservation(prev => ({...prev, tax: Number(e.target.value)}))} />
                        <InputWithLabel name="discountAmount" label="Discount" size={"sm"} labelPosition="top" 
                        value={reservation?.discountAmount} onChange={(e) => setReservation(prev => ({...prev, discountAmount: Number(e.target.value)}))} />
                    </div>
                    <div className="flex gap-2">
                        <Textarea name="remark" placeholder="Remarks ..." value={reservation?.remark ?? ''} onChange={(e) => setReservation(prev => ({...prev, remark: e.target.value}))} />
                    </div>
                </section>
            </div>
        );
    }
);