
import * as React from "react";
import { SelectReservationStatus } from "../selects/selectreservationstatus";
import { SelectReservationType } from "../selects/selectreservationtype";
import { SelectPromotion } from "../selects/selectpromotion";
import { InputDateRange } from "../uicustom/inputdaterange";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { DatePickerCustomWithLabel } from "../uicustom/datepickercustomwithlabel";
import { Button } from "../ui/button";
import { FormState } from "@/lib/types";


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

    const [name, setName] = React.useState("");

    React.useEffect(() => {
        //formRef?.current?.requestSubmit();
    }, [name]);

    return (
        <section aria-label="CheckIn Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <DatePickerCustomWithLabel label="Date" />
                <InputWithLabel label="Guest Name" name="search_name" defaultValue={name} onBlur={(e) => setName(e.target.value)} />
                <InputWithLabel label="National ID" defaultValue={""} />
                <InputWithLabel label="Passport"  defaultValue={""}/>
                <InputWithLabel label="Phone"  defaultValue={""}/>
                <Button onClick={() => formRef?.current?.requestSubmit()}>Search</Button>
            </div>
        </section>
    );
}
