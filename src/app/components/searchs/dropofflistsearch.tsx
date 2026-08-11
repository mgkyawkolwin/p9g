
import * as React from "react";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Label } from "../../../lib/components/web/react/ui/label";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";


const initialData = {
    departureDateTimeFrom: (() => {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return d;
    })(),
    departureDateTimeTo: (() => {
        const d = new Date();
        d.setHours(23, 59, 59, 999);
        return d;
    })(),
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


export default function DropOffListSearch({
    formRef
}: DataTableProps) {

    const [formData, setFormData] = React.useState(initialData);

    return (
        <section aria-label="Reservatoin List Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4 items-center">
                <div className="flex gap-2 items-center">
                    <Label>Departure Date/Time From</Label>
                    <DatePicker
                        selected={formData.departureDateTimeFrom}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, departureDateTimeFrom: date }))
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd HH:mm"
                    />
                    <input type="hidden" name="searchDepartureDateTimeFrom" value={formData.departureDateTimeFrom ? formData.departureDateTimeFrom.toISOFormatDateTimeString() : ''} />
                </div>
                <div className="flex gap-2 items-center">
                    <Label>Departure Date/Time To</Label>
                    <DatePicker
                        selected={formData.departureDateTimeTo}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, departureDateTimeTo: date }))
                        }}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={15}
                        dateFormat="yyyy-MM-dd HH:mm"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd HH:mm"
                    />
                    <input type="hidden" name="searchDepartureDateTimeTo" value={formData.departureDateTimeTo ? formData.departureDateTimeTo.toISOFormatDateTimeString() : ''} />
                </div>
                <InputWithLabel size="md" name="searchId" label="Reservation ID" defaultValue={formData.id} onChange={(e) => setFormData({ ...formData, id: e.target.value })} />
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
