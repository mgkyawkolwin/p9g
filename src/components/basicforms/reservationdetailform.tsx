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
import { SelectList, SelectListForm } from "@/lib/constants";
import Reservation from "@/domain/models/Reservation";
import { Checkbox } from "../ui/checkbox";
import { InputCustom } from "../uicustom/inputcustom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CheckboxCustom } from "../uicustom/CheckboxCustom";



interface ReservationDetailFormInterface {
    resetForm: () => void;
}

export default React.forwardRef<ReservationDetailFormInterface, { initialReservation: Reservation }>(
    function ReservationDetailForm(props, ref) {
        c.i('Client > ReservationDetailForm');

        const [date, setDate] = React.useState(new Date());
        const [reservation, setReservation] = React.useState(props.initialReservation);

        React.useImperativeHandle(ref, () => ({
            resetForm: () => {
                setReservation(new Reservation());
            }
        }));

        React.useEffect(() => {
            if (props.initialReservation){
                setReservation(props.initialReservation);
            }
        }, [props.initialReservation]);

        return (
            <div className="flex flex-col gap-2">
                <section aria-label="Reservation Detail" className="flex gap-2 flex-col w-full">
                    <RadioGroup className="border-[#333]" value={reservation?.reservationType} onValueChange={(value) => setReservation(prev => ({ ...prev, reservationType: value }))} name="reservationType">
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-2">
                                <RadioGroupItem className="border-[#bbb]" value="GENERAL" id="r1" />
                                <Label htmlFor="r1">General</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem className="border-[#bbb]" value="MEMBER" id="r2" />
                                <Label htmlFor="r2">Member</Label>
                            </div>
                            <div className="flex items-center gap-2">
                                <RadioGroupItem className="border-[#bbb]" value="TOUR" id="r3" />
                                <Label htmlFor="r3">Tour</Label>
                                <InputCustom name="tourCompany" variant="form" size="full"/>
                            </div>
                        </div>
                    </RadioGroup>
                    <div className="flex gap-2">
                        <SelectWithLabel name="reservationStatus" label="Reservation Status" size="sm" labelPosition="top" items={SelectListForm.RESERVATION_STATUS}
                            value={reservation?.reservationStatus} onValueChange={value => setReservation(prev => ({ ...prev, reservationStatus: value }))}
                        />
                        <SelectWithLabel name="prepaidPackage" label="Prepaid Packages" size="sm" labelPosition="top" items={SelectListForm.PREPAID_PACKAGES} value={reservation?.prepaidPackage}
                            onValueChange={value => setReservation(prev => ({ ...prev, prepaidPackage: value }))} />
                        <SelectWithLabel name="promotionPackage" label="Promotion Packages" size="sm" labelPosition="top" items={SelectListForm.PROMOTION_PACKAGES} value={reservation?.promotionPackage}
                            onValueChange={value => setReservation(prev => ({ ...prev, promotionPackage: value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Check-in</Label>
                            <DatePicker name="checkInDateUTC"
                                selected={reservation?.checkInDateUTC ? new Date(reservation?.checkInDateUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkOutDateUTC) {
                                        const days = calculateDayDifference(date, reservation.checkOutDateUTC);
                                        setReservation(prev => ({ ...prev, noOfDays: days }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        checkInDateUTC: date
                                    }));
                                }}
                                dateFormat="yyyy-MM-dd"
                                customInput={<InputCustom variant="form" size="md" />} // Uses shadcn/ui Input
                                placeholderText="yyyy-mm-dd"
                                isClearable={true}
                                showIcon
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Check-out</Label>
                            <DatePicker name="checkOutDateUTC"
                                selected={reservation?.checkOutDateUTC ? new Date(reservation?.checkOutDateUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkInDateUTC) {
                                        const days = calculateDayDifference(reservation.checkInDateUTC, date);
                                        setReservation(prev => ({ ...prev, noOfDays: days }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        checkOutDateUTC: date
                                    }));
                                }}
                                dateFormat="yyyy-MM-dd"
                                customInput={<InputCustom variant="form" size="md" />} // Uses shadcn/ui Input
                                placeholderText="yyyy-mm-dd"
                                isClearable={true}
                                showIcon
                            />
                        </div>
                        <InputWithLabel name="noOfDays" label="No of Days*" variant="form" size={"xs"} labelPosition="top" value={reservation?.noOfDays} onChange={(e) => setReservation(prev => ({ ...prev, noOfDays: Number(e.target.value) }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Arrival Date/Time</Label>
                            <DatePicker name="arrivalDateTimeUTC"
                                selected={reservation?.arrivalDateTimeUTC ? new Date(reservation?.arrivalDateTimeUTC) : null}
                                onChange={(date: Date | null) => {
                                    setReservation(prev => ({
                                        ...prev,
                                        arrivalDateTimeUTC: date
                                    }));
                                }}

                                dateFormat="yyyy-MM-dd HH:mm"
                                customInput={<InputCustom variant="form" size="lg" />} // Uses shadcn/ui Input
                                placeholderText="yyyy-mm-dd hh:mm"
                                isClearable={true}
                                showIcon
                                showTimeSelect
                                timeIntervals={5}
                                timeFormat="HH:mm"
                            />
                        </div>
                        <InputWithLabel name="arrivalFlight" label="Arrival Flight" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.arrivalFlight} onChange={(e) => setReservation(prev => ({ ...prev, arrivalFlight: e.target.value }))} />
                        <SelectWithLabel name="pickUpType" label="Pick Up" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION}
                            value={reservation?.pickUpType} onValueChange={value => setReservation(prev => ({ ...prev, pickUpType: value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Departure Date/Time</Label>
                            <DatePicker name="departureDateTimeUTC"
                                selected={reservation?.departureDateTimeUTC ? new Date(reservation?.departureDateTimeUTC) : null}
                                onChange={(date: Date | null) => {
                                    setReservation(prev => ({
                                        ...prev,
                                        departureDateTimeUTC: date
                                    }));
                                }}

                                dateFormat="yyyy-MM-dd HH:mm"
                                customInput={<InputCustom variant="form" size="lg" />} // Uses shadcn/ui Input
                                placeholderText="yyyy-mm-dd hh:mm"
                                isClearable={true}
                                showIcon 
                                showTimeSelect
                                timeIntervals={5}
                                timeFormat="HH:mm"
                            />
                        </div>
                        <InputWithLabel name="departureFlight" label="Dep Flight" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.departureFlight} onChange={(e) => setReservation(prev => ({ ...prev, departureFlight: e.target.value }))} />
                        <SelectWithLabel name="dropOffType" label="Drop Off" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION}
                            value={reservation?.dropOffType} onValueChange={value => setReservation(prev => ({ ...prev, dropOffType: value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <InputWithLabel name="noOfGuests" label="No of Guests" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.noOfGuests} onChange={(e) => setReservation(prev => ({ ...prev, noOfGuests: Number(e.target.value) }))} />
                        <InputWithLabel name="roomNo" label="Room No" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.roomNo} onChange={(e) => setReservation(prev => ({ ...prev, roomNo: e.target.value }))} />
                        <CheckboxCustom id="checkbox" name="isSingleOccupancy"
                        checked={reservation.isSingleOccupancy ? true : false} onCheckedChange={(checked:boolean) => {
                            setReservation(prev => ({...prev, isSingleOccupancy: checked}))
                        }} />
                        {/* <input type="checkbox" checked={reservation.isSingleOccupancy} /> */}
                        {/* <input type="hidden" name="isSingleOccupancy" defaultValue={1} /> */}
                        <Label htmlFor="checkbox">Single Occupancy</Label>
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
                        <InputWithLabel name="tax" label="Tax (%)" variant="form" size={"sm"} labelPosition="top"
                            value={reservation?.tax} onChange={(e) => setReservation(prev => ({ ...prev, tax: Number(e.target.value) }))} />
                        <InputWithLabel name="discountAmount" label="Discount" className="" variant="form" size={"sm"} labelPosition="top"
                            value={reservation?.discountAmount} onChange={(e) => setReservation(prev => ({ ...prev, discountAmount: Number(e.target.value) }))} />
                    </div>
                    <div className="flex gap-2 flex-col">

                        <Textarea name="remark" placeholder="Remarks ..." value={reservation?.remark ?? ''} onChange={(e) => setReservation(prev => ({ ...prev, remark: e.target.value }))} />
                    </div>
                </section>
                <input type="hidden" name="location" defaultValue={reservation.location} />
            </div>
        );
    }
);