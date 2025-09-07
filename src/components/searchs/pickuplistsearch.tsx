
import * as React from "react";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { ButtonCustom } from "../uicustom/buttoncustom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Label } from "../ui/label";
import { InputCustom } from "../uicustom/inputcustom";


const initialData = {
    arrivalDate: new Date(new Date().toDateString()),
    id: "",
    name: "",
    nationalId: "",
    passport: "",
    phone: "",
    remark: ""
};

interface DataTableProps {
    formRef?: React.RefObject<HTMLFormElement | null>;
}


export default function PickUpListSearch({
    formRef
}: DataTableProps) {

    const [formData, setFormData] = React.useState(initialData);

    return (
        <section aria-label="Reservatoin List Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4 items-center">
                <Label>Arrival Date</Label>
                <DatePicker
                    selected={formData.arrivalDate}
                    onChange={(date: Date | null) => {
                        setFormData(prev => ({ ...prev, arrivalDate: date }))
                    }}
                    dateFormat="yyyy-MM-dd"
                    customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                    placeholderText="yyyy-mm-dd"
                    isClearable={true}
                    showIcon
                />
                <input type="hidden" name="searchArrivalDateTime" defaultValue={formData.arrivalDate ? formData.arrivalDate.toLocaleDateString('sv-SE') : ''} />
                <InputWithLabel size="md" name="searchRemark" label="Remark" defaultValue={formData.remark} onChange={(e) => setFormData({ ...formData, remark: e.target.value })} />
            </div>
            <div className="flex gap-4 items-center">
                <InputWithLabel size="md" name="searchName" label="Customer Name" defaultValue={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                <InputWithLabel size="md" name="searchNationalId" label="National ID" defaultValue={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} />
                <InputWithLabel size="md" name="searchPassport" label="Passport" defaultValue={formData.passport} onChange={(e) => setFormData({ ...formData, passport: e.target.value })} />
                <InputWithLabel size="md" name="searchPhone" label="Phone" defaultValue={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                <ButtonCustom onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
            </div>
        </section>
    );
}
