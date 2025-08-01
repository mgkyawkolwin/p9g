
import * as React from "react";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { SelectWithLabel } from "../uicustom/selectwithlabel";
import { SelectListSearch } from "@/lib/constants";
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import { ButtonCustom } from "../uicustom/buttoncustom";


const initialData = {
    checkInDateUTC: undefined,
    createdDateFrom: '',
    createdDateUntil: '',
    checkInDateFrom: '',
    checkInDateUntil: '',
    id: "",
    name: "",
    prepaidPackage: "DEFAULT",
    promotionPackage: "DEFAULT",
    reservationStatus: "DEFAULT",
    reservationType: "DEFAULT",
    remark:""
};

interface DataTableProps {
    formRef?: React.RefObject<HTMLFormElement | null>;
}


export default function ReservationListSearch({
    formRef
  }: DataTableProps){

    const [formData, setFormData] = React.useState(initialData);

    return (
        <section aria-label="Reservatoin List Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <SelectWithLabel label="Reservation Status" items={SelectListSearch.RESERVATION_STATUS} defaultValue={formData.reservationStatus} onValueChange={(value) => setFormData({...formData, reservationStatus: value})} />
                <SelectWithLabel label="Reservation Type" items={SelectListSearch.RESERVATION_TYPE} defaultValue={formData.reservationType} onValueChange={(value) => setFormData({...formData, reservationType: value})} />
                <SelectWithLabel label="Promotion" items={SelectListSearch.PROMOTION_PACKAGES} defaultValue={formData.promotionPackage} onValueChange={(value) => setFormData({...formData, promotionPackage: value})} />
                <SelectWithLabel label="Prepaid" items={SelectListSearch.PREPAID_PACKAGES} defaultValue={formData.prepaidPackage} onValueChange={(value) => setFormData({...formData, prepaidPackage: value})} />
                <input type="hidden" name="searchReservationStatus" value={formData.reservationStatus} />
                <input type="hidden" name="searchReservationType" value={formData.reservationType} />
                <input type="hidden" name="searchPromotionPackage" value={formData.promotionPackage} />
                <input type="hidden" name="searchPrepaidPackage" value={formData.prepaidPackage} />
            </div>
            <div className="flex gap-4 items-center">
                <DateInputWithLabel type="date" name="searchCheckInDateFrom" label="Check-In From" defaultValue={formData.checkInDateFrom} onChange={(e) => setFormData({...formData, checkInDateFrom: e.target.value})} />
                <DateInputWithLabel type="date" name="searchCheckInDateUntil" label="Until" defaultValue={formData.checkInDateUntil} onChange={(e) => setFormData({...formData, checkInDateUntil: e.target.value})}/>
                <InputWithLabel size="md" name="searchId" label="Reservation ID" defaultValue={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}/>
                <InputWithLabel size="md" name="searchName" label="Customer Name" defaultValue={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}/>
                <InputWithLabel size="md" name="searchRemark" label="Remark" defaultValue={formData.remark} onChange={(e) => setFormData({...formData, remark: e.target.value})}/>
                <ButtonCustom onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
            </div>
        </section>
    );
}
