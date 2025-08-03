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
import { calculateDayDifference, getCheckInDate, getCheckOutDate, getUTCISODateString } from "@/lib/utils";
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

        const calculateDiscount = () => {
            if(!reservation) return;
            if(!reservation.promotionPackage) return;
            if(reservation.promotionPackage != 'DEFAULT'){
                
                const noOfGuests = Number(reservation.noOfGuests ?? 0);
                const noOfDays = Number(reservation.noOfDays ?? 0);
                const discount = 10000 * noOfDays * noOfGuests;
                setReservation(prev => ({...prev, discountAmount:discount}));
            }
        };

        // React.useEffect(() => {
        //     if(reservation.checkInDateUTC || reservation.checkOutDateUTC){
        //         const days = calculateDayDifference(reservation.checkInDateUTC, reservation.checkOutDateUTC);
        //         setReservation(prev => ({ ...prev, noOfDays: days }));
        //     }else{
        //         setReservation(prev => ({ ...prev, noOfDays: 0 }));
        //     }
        // }, [reservation.checkInDateUTC, reservation.checkOutDateUTC]);

        // React.useEffect(() => {
        //     calculateDiscount();
        // }, [reservation.noOfDays, reservation.noOfGuests, reservation.promotionPackage]);

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
                            onValueChange={value => {
                                setReservation(prev => ({ ...prev, prepaidPackage: value }));
                                calculateDiscount();
                                }} />
                        <SelectWithLabel name="promotionPackage" label="Promotion Packages" size="sm" labelPosition="top" items={SelectListForm.PROMOTION_PACKAGES} value={reservation?.promotionPackage}
                            onValueChange={value => {
                                setReservation(prev => ({ ...prev, promotionPackage: value }));
                                calculateDiscount();
                                }} />
                    </div>
                    
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Arrival Date/Time</Label>
                            <DatePicker
                                selected={reservation?.arrivalDateTimeUTC ? new Date(reservation?.arrivalDateTimeUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkOutDateUTC) {
                                        const days = calculateDayDifference(getCheckInDate(date), reservation.checkOutDateUTC);
                                        
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        arrivalDateTimeUTC: date,
                                        checkInDateUTC: date ? getCheckInDate(date) : undefined
                                    }));
                                    calculateDiscount();
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
                            <input type="hidden" name="arrivalDateTimeUTC" defaultValue={reservation.arrivalDateTimeUTC ? reservation.arrivalDateTimeUTC.toISOString() : ''} />
                        </div>
                        <InputWithLabel name="arrivalFlight" label="Arrival Flight" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.arrivalFlight} onChange={(e) => setReservation(prev => ({ ...prev, arrivalFlight: e.target.value }))} />
                        <SelectWithLabel name="pickUpType" label="Pick Up" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION}
                            value={reservation?.pickUpType} onValueChange={value => setReservation(prev => ({ ...prev, pickUpType: value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Departure Date/Time</Label>
                            <DatePicker
                                selected={reservation?.departureDateTimeUTC ? new Date(reservation?.departureDateTimeUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation.checkInDateUTC) {
                                        const days = calculateDayDifference(reservation.checkInDateUTC, getCheckOutDate(date));
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        departureDateTimeUTC: date,
                                        checkOutDateUTC: date ? getCheckOutDate(date) : undefined
                                    }));
                                    calculateDiscount();
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
                            <input type="hidden" name="departureDateTimeUTC" defaultValue={reservation.departureDateTimeUTC ? reservation.departureDateTimeUTC.toISOString() : ''} />
                        </div>
                        <InputWithLabel name="departureFlight" label="Dep Flight" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.departureFlight} onChange={(e) => setReservation(prev => ({ ...prev, departureFlight: e.target.value }))} />
                        <SelectWithLabel name="dropOffType" label="Drop Off" size={"sm"} labelPosition="top" items={SelectList.TRANSPORTATION}
                            value={reservation?.dropOffType} onValueChange={value => setReservation(prev => ({ ...prev, dropOffType: value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Check-in</Label>
                            <DatePicker
                                selected={reservation?.checkInDateUTC ? new Date(reservation?.checkInDateUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkOutDateUTC) {
                                        const days = calculateDayDifference(date, reservation.checkOutDateUTC);
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        checkInDateUTC: date
                                    }));
                                    calculateDiscount();
                                }}
                                dateFormat="yyyy-MM-dd"
                                customInput={<InputCustom variant="form" size="md" />} // Uses shadcn/ui Input
                                placeholderText="yyyy-mm-dd"
                                isClearable={true}
                                showIcon
                            />
                            <input type="hidden" name="checkInDateUTC" defaultValue={reservation.checkInDateUTC ? reservation.checkInDateUTC.toISOString() : ''} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Check-out</Label>
                            <DatePicker
                                selected={reservation?.checkOutDateUTC ? new Date(reservation?.checkOutDateUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkInDateUTC) {
                                        const days = calculateDayDifference(reservation.checkInDateUTC, date);
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        checkOutDateUTC: date
                                    }));
                                    calculateDiscount();
                                }}
                                dateFormat="yyyy-MM-dd"
                                customInput={<InputCustom variant="form" size="md" />} // Uses shadcn/ui Input
                                placeholderText="yyyy-mm-dd"
                                isClearable={true}
                                showIcon
                            />
                            <input type="hidden" name="checkOutDateUTC" defaultValue={reservation.checkOutDateUTC ? reservation.checkOutDateUTC.toISOString() : ''} />
                        </div>
                        <InputWithLabel name="noOfDays" label="No of Days*" variant="form" size={"xs"} labelPosition="top" 
                        value={reservation?.noOfDays} onChange={(e) => {
                            const days = parseInt(e.target.value) ?? 0;
                            setReservation(prev => ({ ...prev, noOfDays: days >= 0 ? days : 0 }));
                            calculateDiscount();
                            
                        }
                            } />
                    </div>
                    <div className="flex gap-2 items-end">
                        <InputWithLabel name="noOfGuests" label="No of Guests" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.noOfGuests} onChange={(e) => {
                                setReservation(prev => ({ ...prev, noOfGuests: Number(e.target.value) }));
                                //calculateDiscount();
                                }} />
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
                    <div className="flex gap-2 items-end">
                        <InputWithLabel name="depositAmount" label="Deposit" variant="form" size={"xs"} labelPosition="top" 
                        value={reservation?.depositAmount} onChange={(e) => setReservation(prev => ({...prev, depositAmount: Number(e.target.value)}))} />
                        <InputWithLabel name="depositAmountInCurrency" label="Currency Amt" variant="form" size={"xs"} labelPosition="top" 
                        value={reservation?.depositAmountInCurrency} onChange={(e) => setReservation(prev => ({...prev, depositAmountInCurrency: Number(e.target.value)}))} />
                        <SelectWithLabel name="depositCurrency" label="Currency" size={"sm"} labelPosition="top" items={SelectList.CURRENCY} 
                        value={reservation?.depositCurrency} onValueChange={(value) => setReservation(prev => ({...prev, depositCurrency: value}))} />
                        <DateInputWithLabel label="Deposit Date" type="date" size={"sm"} labelPosition="top" 
                        value={reservation?.depositDateUTC ? new Date(reservation?.depositDateUTC).toLocaleDateString('sv-SE') : ''}
                            onChange={(e) => {
                                const newDate = e.target.value ? new Date(e.target.value) : undefined;
                                setReservation(prev => ({
                                    ...prev,
                                    depositDateUTC: newDate
                                }));
                            }} />
                        <input type="hidden" name="depositDateUTC" defaultValue={reservation.depositDateUTC ? reservation.depositDateUTC.toISOString() : ''} />
                    </div>
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