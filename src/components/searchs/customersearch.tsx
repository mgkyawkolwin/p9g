
import * as React from "react";
import { SelectReservationStatus } from "../selects/selectreservationstatus";
import { SelectReservationType } from "../selects/selectreservationtype";
import { SelectPromotion } from "../selects/selectpromotion";
import { InputDateRange } from "../uicustom/inputdaterange";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { DatePickerCustomWithLabel } from "../uicustom/datepickercustomwithlabel";
import { Button } from "../ui/button";
import { FormState } from "@/lib/types";
import { ButtonCustom } from "../uicustom/buttoncustom";


interface DataTableProps {
  formState?: FormState
  formAction: (formData: FormData) => void
    formRef?: React.RefObject<HTMLFormElement | null>;
  isPending?: boolean
}

export default function CustomerSearch({
    formState,
    formAction,
    formRef,
    isPending
  }: DataTableProps){

    const [searchName, setSearchName] = React.useState("");
    const [searchNationalId, setSearchNationalId] = React.useState("");
    const [searchPassport, setSearchPassport] = React.useState("");
    const [searchPhone, setSearchPhone] = React.useState("");

    React.useEffect(() => {
        //formRef?.current?.requestSubmit();
    }, [name]);

    return (
        <section aria-label="CheckIn Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <InputWithLabel label="Guest Name" name="searchName" defaultValue={searchName} onBlur={(e) => setSearchName(e.target.value)} />
                <InputWithLabel label="National ID" name="searchNationalId" defaultValue={searchNationalId} onBlur={(e) => setSearchNationalId(e.target.value)} />
                <InputWithLabel label="Passport"  name="searchPassport" defaultValue={searchPassport} onBlur={(e) => setSearchPassport(e.target.value)} />
                <InputWithLabel label="Phone"  name="searchPhone" defaultValue={searchPhone} onBlur={(e) => setSearchPhone(e.target.value)} />
                <ButtonCustom variant={"black"} onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
            </div>
        </section>
    );
}
