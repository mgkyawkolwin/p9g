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
import { calculateDayDifference, getCheckInDate, getCheckOutDate } from "@/lib/utils";
import c from "@/lib/core/logger/ConsoleLogger";
import { SelectList, SelectListForm } from "@/lib/constants";
import Reservation from "@/domain/models/Reservation";
import { InputCustom } from "../uicustom/inputcustom";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CheckboxCustom } from "../uicustom/CheckboxCustom";



interface ReservationDetailFormInterface {
    resetForm: () => void;
    getReservation?: () => Reservation;
}

export default React.forwardRef<ReservationDetailFormInterface, { initialReservation: Reservation }>(
    function ReservationDetailForm(props, ref) {
        c.i('Client > ReservationDetailForm');

        const [date, setDate] = React.useState(new Date());
        const [reservation, setReservation] = React.useState(props.initialReservation);


        React.useImperativeHandle(ref, () => ({
            resetForm: () => {
                setReservation(new Reservation());
            },
            getReservation: () => {
                return reservation;
            },

        }));


        React.useEffect(() => {
            if (props.initialReservation){
                setReservation(props.initialReservation);
            }
        }, [props.initialReservation]);


        const calculateDiscount = ({promotionPackage, noOfDays, noOfGuests}:{promotionPackage?:string, noOfDays?:number, noOfGuests?:number}) => {
            if(!reservation) return;
            let promotion = 1;
            if(!promotionPackage && !reservation.promotionPackage) promotion = 0;
            if(promotionPackage && promotionPackage === 'DEFAULT') promotion = 0;
            if(!promotionPackage && reservation.promotionPackage === 'DEFAULT') promotion = 0;
            

            const guests = noOfGuests ? noOfGuests : Number(reservation.noOfGuests ?? 0);
            const days = noOfDays ? noOfDays : Number(reservation.noOfDays ?? 0);
            const discount = 10000 * days * guests * promotion;
            setReservation(prev => ({...prev, discountAmount:discount}));
        };


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
                                <InputCustom name="tourCompany" variant="form" size="full"
                                value={reservation?.tourCompany ? reservation?.tourCompany : ''}
                                onChange={e => setReservation(prev => ({...prev, tourCompany: e.target.value ? e.target.value : ""}))} />
                            </div>
                        </div>
                    </RadioGroup>
                    <div className="flex gap-2">
                        <SelectWithLabel name="reservationStatus" label="Reservation Status" variant="form" size="sm" labelPosition="top" items={SelectListForm.RESERVATION_STATUS}
                            value={reservation?.reservationStatus} onValueChange={value => setReservation(prev => ({ ...prev, reservationStatus: value }))}
                        />
                        <SelectWithLabel name="prepaidPackage" label="Prepaid Packages" variant="form" size="sm" labelPosition="top" items={SelectListForm.PREPAID_PACKAGES} value={reservation?.prepaidPackage ? reservation?.prepaidPackage : 'DEFAULT'}
                            onValueChange={value => {
                                setReservation(prev => ({ ...prev, prepaidPackage: value === 'DEFAULT' ? '' : value }));
                                }} />
                        <SelectWithLabel name="promotionPackage" label="Promotion Packages" variant="form" size="sm" labelPosition="top" items={SelectListForm.PROMOTION_PACKAGES} value={reservation?.promotionPackage ? reservation?.promotionPackage : 'DEFAULT'}
                            onValueChange={value => {
                                setReservation(prev => ({ ...prev, promotionPackage: value === 'DEFAULT' ? '' : value }));
                                calculateDiscount({promotionPackage:value});
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
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        arrivalDateTimeUTC: date,
                                        checkInDateUTC: date ? getCheckInDate(date) : undefined
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
                            <input type="hidden" name="arrivalDateTimeUTC" defaultValue={reservation.arrivalDateTimeUTC ? reservation.arrivalDateTimeUTC.toISOString() : ''} />
                        </div>
                        <InputWithLabel name="arrivalFlight" label="Arrival Flight" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.arrivalFlight} onChange={(e) => setReservation(prev => ({ ...prev, arrivalFlight: e.target.value }))} />
                        <SelectWithLabel name="pickUpType" label="Pick Up" variant="form" size={"sm"} labelPosition="top" items={SelectListForm.TRANSPORTATION}
                            value={reservation?.pickUpType ? reservation?.pickUpType : 'DEFAULT'} onValueChange={value => setReservation(prev => ({ ...prev, pickUpType: value === 'DEFAULT' ? '' : value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Departure Date/Time</Label>
                            <DatePicker
                                selected={reservation?.departureDateTimeUTC ? new Date(reservation?.departureDateTimeUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation.checkInDateUTC) {
                                        const days = calculateDayDifference(reservation.checkInDateUTC, getCheckOutDate(date));
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        departureDateTimeUTC: date,
                                        checkOutDateUTC: date ? getCheckOutDate(date) : undefined
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
                            <input type="hidden" name="departureDateTimeUTC" defaultValue={reservation.departureDateTimeUTC ? reservation.departureDateTimeUTC.toISOString() : ''} />
                        </div>
                        <InputWithLabel name="departureFlight" label="Dep Flight" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.departureFlight} onChange={(e) => setReservation(prev => ({ ...prev, departureFlight: e.target.value }))} />
                        <SelectWithLabel name="dropOffType" label="Drop Off" variant="form" size={"sm"} labelPosition="top" items={SelectListForm.TRANSPORTATION}
                            value={reservation?.dropOffType ? reservation?.dropOffType : 'DEFAULT'} onValueChange={value => setReservation(prev => ({ ...prev, dropOffType: value === 'DEFAULT' ? '' : value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Check-in</Label>
                            <DatePicker
                                selected={reservation?.checkInDateUTC ? new Date(reservation?.checkInDateUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkOutDateUTC) {
                                        const days = calculateDayDifference(date, reservation.checkOutDateUTC);
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
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
                            <input type="hidden" name="checkInDateUTC" defaultValue={reservation.checkInDateUTC ? reservation.checkInDateUTC.toISOString() : ''} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Check-out</Label>
                            <DatePicker
                                selected={reservation?.checkOutDateUTC ? new Date(reservation?.checkOutDateUTC) : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkInDateUTC) {
                                        const days = calculateDayDifference(reservation.checkInDateUTC, date);
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
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
                            <input type="hidden" name="checkOutDateUTC" defaultValue={reservation.checkOutDateUTC ? reservation.checkOutDateUTC.toISOString() : ''} />
                        </div>
                        <InputWithLabel name="noOfDays" label="No of Days*" variant="form" size={"xs"} labelPosition="top" 
                        value={reservation?.noOfDays} onChange={(e) => {
                            const days = e.target.value ? parseInt(e.target.value) : 0;
                            setReservation(prev => ({ ...prev, noOfDays: days >= 0 ? days : 0 }));
                            calculateDiscount({noOfDays:days});
                            
                        }
                            } />
                    </div>
                    <div className="flex gap-2 items-end">
                        <InputWithLabel name="noOfGuests" label="No of Guests" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.noOfGuests} onChange={(e) => {
                                const days = e.target.value ? parseInt(e.target.value) : 0;
                                setReservation(prev => ({ ...prev, noOfGuests: Number(e.target.value) }));
                                calculateDiscount({noOfGuests:days});
                                }} />
                        <InputWithLabel name="roomNo" label="Room No" variant="form" size={"xs"} labelPosition="top"
                            value={reservation?.roomNo} onChange={(e) => setReservation(prev => ({ ...prev, roomNo: e.target.value }))} />
                        <CheckboxCustom id="checkbox" name="isSingleOccupancy"
                        checked={reservation.isSingleOccupancy ? true : false} onCheckedChange={(checked:boolean) => {
                            setReservation(prev => ({...prev, isSingleOccupancy: checked}))
                        }} />
                        <Label htmlFor="checkbox">Single Occupancy</Label>
                    </div>
                    <div className="flex gap-2 items-end">
                        <InputWithLabel name="depositAmount" label="Deposit" variant="form" size={"xs"} labelPosition="top" 
                        value={reservation?.depositAmount} onChange={(e) => setReservation(prev => ({...prev, depositAmount: Number(e.target.value)}))} />
                        <InputWithLabel name="depositAmountInCurrency" label="Currency Amt" variant="form" size={"xs"} labelPosition="top" 
                        value={reservation?.depositAmountInCurrency} onChange={(e) => setReservation(prev => ({...prev, depositAmountInCurrency: Number(e.target.value)}))} />
                        <SelectWithLabel name="depositCurrency" label="Currency" variant="form" size={"xs"} labelPosition="top" items={SelectList.CURRENCY} 
                        value={reservation?.depositCurrency} onValueChange={(value) => setReservation(prev => ({...prev, depositCurrency: value}))} />
                        <SelectWithLabel name="depositPaymentMode" label="Mode" variant="form" size={"xs"} labelPosition="top" items={SelectList.PAYMENT_MODE} 
                        value={reservation?.depositPaymentMode} onValueChange={(value) => setReservation(prev => ({...prev, depositPaymentMode: value}))} />
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Deposit Date</Label>
                            <DatePicker
                                selected={reservation?.depositDateUTC ? new Date(reservation?.depositDateUTC) : null}
                                onChange={(date: Date | null) => {
                                    setReservation(prev => ({
                                        ...prev,
                                        depositDateUTC: date
                                    }));
                                }}
                                dateFormat="yyyy-MM-dd"
                                customInput={<InputCustom variant="form" size="md" />}
                                placeholderText="yyyy-mm-dd"
                                isClearable={true}
                                showIcon
                            />
                            <input type="hidden" name="depositDateUTC" defaultValue={reservation.depositDateUTC ? reservation.depositDateUTC.toISOString() : ''} />
                        </div>
                    </div>
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