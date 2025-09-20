
import * as React from "react";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { SelectWithLabel } from "../../../lib/components/web/react/uicustom/selectwithlabel";
import { SelectListSearch } from "@/core/constants";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { Label } from "../../../lib/components/web/react/ui/label";
import { getISODateTimeMidNightString, getISODateTimeString } from "@/lib/utils";


const initialData = {
    checkInDateUTC: undefined,
    createdDateFrom: null,
    createdDateUntil: null,
    checkInDateFrom: null,
    checkInDateUntil: null,
    existingCheckIn: null,
    id: "",
    name: "",
    prepaidPackage: "DEFAULT",
    promotionPackage: "DEFAULT",
    reservationStatus: "DEFAULT",
    reservationType: "DEFAULT",
    remark: ""
};

interface DataTableProps {
    formRef?: React.RefObject<HTMLFormElement | null>;
}


export default function ReservationListSearch({
    formRef
}: DataTableProps) {

    const [formData, setFormData] = React.useState(initialData);

    return (
        <section aria-label="Reservatoin List Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <SelectWithLabel label="Reservation Status" labelPosition="top" items={SelectListSearch.RESERVATION_STATUS} defaultValue={formData.reservationStatus} onValueChange={(value) => setFormData({ ...formData, reservationStatus: value })} />
                <SelectWithLabel label="Reservation Type" labelPosition="top" items={SelectListSearch.RESERVATION_TYPE} defaultValue={formData.reservationType} onValueChange={(value) => setFormData({ ...formData, reservationType: value })} />
                <SelectWithLabel label="Promotion" labelPosition="top" items={SelectListSearch.PROMOTION_PACKAGES} defaultValue={formData.promotionPackage} onValueChange={(value) => setFormData({ ...formData, promotionPackage: value })} />
                <SelectWithLabel label="Prepaid" labelPosition="top" items={SelectListSearch.PREPAID_PACKAGES} defaultValue={formData.prepaidPackage} onValueChange={(value) => setFormData({ ...formData, prepaidPackage: value })} />
                <input type="hidden" name="searchReservationStatus" value={formData.reservationStatus} />
                <input type="hidden" name="searchReservationType" value={formData.reservationType} />
                <input type="hidden" name="searchPromotionPackage" value={formData.promotionPackage} />
                <input type="hidden" name="searchPrepaidPackage" value={formData.prepaidPackage} />
                <InputWithLabel labelPosition="top" size="md" name="searchId" label="Reservation ID" defaultValue={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} />
                <InputWithLabel labelPosition="top" size="md" name="searchName" label="Customer Name" defaultValue={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <InputWithLabel labelPosition="top" size="md" name="searchRemark" label="Remark" defaultValue={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
            </div>
            <div className="flex gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <Label>Check-In Date From</Label>
                    <DatePicker
                        selected={formData.checkInDateFrom}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, checkInDateFrom: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchCheckInDateFrom" defaultValue={formData.checkInDateFrom ? formData.checkInDateFrom.toLocaleDateString('sv-SE') : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Until</Label>
                    <DatePicker
                        selected={formData.checkInDateUntil}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, checkInDateUntil: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchCheckInDateUntil" defaultValue={formData.checkInDateUntil ? formData.checkInDateUntil.toLocaleDateString('sv-SE') : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Created Date From</Label>
                    <DatePicker
                        selected={formData.createdDateFrom}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, createdDateFrom: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchCreatedDateFrom" defaultValue={formData.createdDateFrom ? formData.createdDateFrom.toISOFormatDateTimeString() : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Created Until</Label>
                    <DatePicker
                        selected={formData.createdDateUntil}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, createdDateUntil: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchCreatedDateUntil" defaultValue={formData.createdDateUntil ? formData.createdDateUntil.toISOFormatDateTimeMidNightString() : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Check-in Date (Existing)</Label>
                    <DatePicker
                        selected={formData.existingCheckIn}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, existingCheckIn: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchExistingReservations" defaultValue={formData.existingCheckIn ? formData.existingCheckIn.toISOFormatDateTimeString() : ''} />
                </div>
                <ButtonCustom onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
            </div>
        </section>
    );
}
