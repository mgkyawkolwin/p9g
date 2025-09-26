'use client';

import { SelectList, SelectListForm } from "@/core/constants";
import { getCheckInDate, getCheckOutDate } from "@/core/helpers";
import Reservation from "@/core/models/domain/Reservation";
import { Label } from "@/lib/components/web/react/ui/label";
import {
    RadioGroup,
    RadioGroupItem,
} from "@/lib/components/web/react/ui/radio-group";
import { calculateDayDifference } from "@/lib/utils";
import React from "react";
import { Textarea } from "../../../lib/components/web/react/ui/textarea";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { SelectWithLabel } from "../../../lib/components/web/react/uicustom/selectwithlabel";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CheckboxCustom } from "../../../lib/components/web/react/uicustom/CheckboxCustom";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import {v4 as uuidv4} from 'uuid';


interface ReservationDetailFormInterface {
    resetForm: () => void;
    getReservation?: () => Reservation;
}

export default React.forwardRef<ReservationDetailFormInterface, { initialReservation: Reservation }>(
    function ReservationDetailForm(props, ref) {

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
                                <InputCustom name="prepaidCode" variant="form" size="full"
                                value={reservation?.prepaidCode ? reservation?.prepaidCode : ''}
                                onChange={e => setReservation(prev => ({...prev, prepaidCode: e.target.value ? e.target.value : ""}))} />
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
                                selected={reservation?.arrivalDateTime ? reservation?.arrivalDateTime.convertToFakeLocalDate() : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkOutDate) {
                                        const days = calculateDayDifference(getCheckInDate(date.convertToFakeLocalDate()), reservation.checkOutDate);
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        arrivalDateTime: date ? date.convertToUTCFromFakeLocalDateTime() : undefined,
                                        checkInDate: date ? getCheckInDate(date.convertToUTCFromFakeLocalDateTime()) : undefined
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
                            value={reservation?.arrivalFlight ? reservation?.arrivalFlight : ''} onChange={(e) => setReservation(prev => ({ ...prev, arrivalFlight: e.target.value }))} />
                        <SelectWithLabel name="pickUpType" label="Pick Up" variant="form" size={"sm"} labelPosition="top" items={SelectListForm.TRANSPORTATION}
                            value={reservation?.pickUpType ? reservation?.pickUpType : 'DEFAULT'} onValueChange={value => setReservation(prev => ({ ...prev, pickUpType: value === 'DEFAULT' ? '' : value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Departure Date/Time</Label>
                            <DatePicker
                                selected={reservation?.departureDateTime ? reservation?.departureDateTime.convertToFakeLocalDate() : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation.checkInDate) {
                                        const days = calculateDayDifference(reservation.checkInDate, getCheckOutDate(date));
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        departureDateTime: date ? date.convertToUTCFromFakeLocalDateTime() : undefined,
                                        checkOutDate: date ? getCheckOutDate(date.convertToUTCFromFakeLocalDateTime()) : undefined
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
                            value={reservation?.departureFlight ? reservation?.departureFlight : ''} onChange={(e) => setReservation(prev => ({ ...prev, departureFlight: e.target.value }))} />
                        <SelectWithLabel name="dropOffType" label="Drop Off" variant="form" size={"sm"} labelPosition="top" items={SelectListForm.TRANSPORTATION}
                            value={reservation?.dropOffType ? reservation?.dropOffType : 'DEFAULT'} onValueChange={value => setReservation(prev => ({ ...prev, dropOffType: value === 'DEFAULT' ? '' : value }))} />
                    </div>
                    <div className="flex gap-2 items-end">
                        <div className="flex flex-col gap-2">
                            <Label className="text-[10pt]">Check-in</Label>
                            <DatePicker
                                selected={reservation?.checkInDate ? reservation?.checkInDate.convertToFakeLocalDate() : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkOutDate) {
                                        const days = calculateDayDifference(date.convertToUTCFromFakeLocalDate(), reservation.checkOutDate);
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        checkInDate: date ? date.convertToUTCFromFakeLocalDate() : undefined
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
                            <DatePicker
                                selected={reservation?.checkOutDate ? reservation?.checkOutDate.convertToFakeLocalDate() : null}
                                onChange={(date: Date | null) => {
                                    if (date && reservation?.checkInDate) {
                                        const days = calculateDayDifference(reservation.checkInDate, date.convertToUTCFromFakeLocalDate());
                                        calculateDiscount({noOfDays:days});
                                        setReservation(prev => ({ ...prev, noOfDays: days < 0 ? 0 : days }));
                                    }else{
                                        setReservation(prev => ({ ...prev, noOfDays: 0 }));
                                    }
                                    setReservation(prev => ({
                                        ...prev,
                                        checkOutDate: date ? date.convertToUTCFromFakeLocalDate() : undefined
                                    }));
                                    
                                }}
                                dateFormat="yyyy-MM-dd"
                                customInput={<InputCustom variant="form" size="md" />} // Uses shadcn/ui Input
                                placeholderText="yyyy-mm-dd"
                                isClearable={true}
                                showIcon
                            />
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
                            value={reservation?.roomNo ?? ''} onChange={(e) => setReservation(prev => ({ ...prev, roomNo: e.target.value }))} />
                        <CheckboxCustom id="checkbox" name="isSingleOccupancy"
                        checked={reservation.isSingleOccupancy ? true : false} onCheckedChange={(checked:boolean) => {
                            setReservation(prev => ({...prev, isSingleOccupancy: checked}))
                        }} />
                        <Label htmlFor="checkbox">Single Occupancy</Label>
                        <ButtonCustom size="sm" onClick={() => setReservation(prev => ({...prev, roomNo: uuidv4().substring(0,8)}))}>Generate</ButtonCustom>
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