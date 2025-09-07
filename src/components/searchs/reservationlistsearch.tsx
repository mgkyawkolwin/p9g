
import * as React from "react";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { SelectWithLabel } from "../uicustom/selectwithlabel";
import { SelectListSearch } from "@/core/lib/constants";
import { ButtonCustom } from "../uicustom/buttoncustom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputCustom } from "../uicustom/inputcustom";
import { Label } from "../ui/label";


const initialData = {
    checkInDateUTC: undefined,
    createdDateFrom: null,
    createdDateUntil: '',
    checkInDateFrom: null,
    checkInDateUntil: null,
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
                <SelectWithLabel label="Reservation Status" items={SelectListSearch.RESERVATION_STATUS} defaultValue={formData.reservationStatus} onValueChange={(value) => setFormData({ ...formData, reservationStatus: value })} />
                <SelectWithLabel label="Reservation Type" items={SelectListSearch.RESERVATION_TYPE} defaultValue={formData.reservationType} onValueChange={(value) => setFormData({ ...formData, reservationType: value })} />
                <SelectWithLabel label="Promotion" items={SelectListSearch.PROMOTION_PACKAGES} defaultValue={formData.promotionPackage} onValueChange={(value) => setFormData({ ...formData, promotionPackage: value })} />
                <SelectWithLabel label="Prepaid" items={SelectListSearch.PREPAID_PACKAGES} defaultValue={formData.prepaidPackage} onValueChange={(value) => setFormData({ ...formData, prepaidPackage: value })} />
                <input type="hidden" name="searchReservationStatus" value={formData.reservationStatus} />
                <input type="hidden" name="searchReservationType" value={formData.reservationType} />
                <input type="hidden" name="searchPromotionPackage" value={formData.promotionPackage} />
                <input type="hidden" name="searchPrepaidPackage" value={formData.prepaidPackage} />
            </div>
            <div className="flex gap-4 items-center">
                <Label>Check-In Date From</Label>
                <DatePicker  name="searchCheckInDateFrom"
                    selected={formData.checkInDateFrom}
                    onChange={(date: Date | null) => {
                        setFormData(prev => ({...prev, checkInDateFrom: date}))
                    }}
                    dateFormat="yyyy-MM-dd"
                    customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                    placeholderText="yyyy-mm-dd"
                    isClearable={true}
                    showIcon
                />
                <input type="hidden" name="searchCheckInDateFrom" defaultValue={formData.checkInDateFrom ? formData.checkInDateFrom.toLocaleDateString('sv-SE') : ''} />
                <Label>Until</Label>
                <DatePicker
                    selected={formData.checkInDateUntil}
                    onChange={(date: Date | null) => {
                        setFormData(prev => ({...prev, checkInDateUntil: date}))
                    }}
                    dateFormat="yyyy-MM-dd"
                    customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                    placeholderText="yyyy-mm-dd"
                    isClearable={true}
                    showIcon
                />
                <input type="hidden" name="searchCheckInDateUntil" defaultValue={formData.checkInDateUntil ? formData.checkInDateUntil.toLocaleDateString('sv-SE') : ''} />
                <InputWithLabel size="md" name="searchId" label="Reservation ID" defaultValue={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} />
                <InputWithLabel size="md" name="searchName" label="Customer Name" defaultValue={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <InputWithLabel size="md" name="searchRemark" label="Remark" defaultValue={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
                <ButtonCustom onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
            </div>
        </section>
    );
}
