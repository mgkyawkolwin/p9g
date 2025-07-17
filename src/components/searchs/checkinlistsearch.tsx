
import * as React from "react";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import { ButtonCustom } from "../uicustom/buttoncustom";


const initialData = {
    checkInDate: new Date().toLocaleDateString('sv-SE'),//use locale date to set today date
    id: "",
    name: "",
    nationalId: "",
    passport: "",
    phone: ""
};

interface DataTableProps {
    formRef?: React.RefObject<HTMLFormElement | null>;
}


export default function CheckInListSearch({
    formRef
  }: DataTableProps){

    const [formData, setFormData] = React.useState(initialData);

    return (
        <section aria-label="Reservatoin List Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4 items-center">
                <DateInputWithLabel type="date" name="searchCheckInDateUTC" label="Check-In Date" defaultValue={formData.checkInDate} onChange={(e) => setFormData({...formData, checkInDate: e.target.value})} />
                <InputWithLabel name="searchId" label="Reservation ID" defaultValue={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})}/>
            </div>
            <div className="flex gap-4 items-center">
                <InputWithLabel name="searchName" label="Customer Name" defaultValue={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})}/>
                <InputWithLabel name="searchNationalId" label="National ID" defaultValue={formData.nationalId} onChange={(e) => setFormData({...formData, nationalId: e.target.value})}/>
                <InputWithLabel name="searchPassport" label="Passport" defaultValue={formData.passport} onChange={(e) => setFormData({...formData, passport: e.target.value})}/>
                <InputWithLabel name="searchPhone" label="Phone" defaultValue={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})}/>
                <ButtonCustom onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
            </div>
        </section>
    );
}
