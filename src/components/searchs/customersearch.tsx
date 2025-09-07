
import * as React from "react";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { FormState } from "@/core/lib/types";
import { ButtonCustom } from "../uicustom/buttoncustom";
import CustomerNewForm from "../forms/customernewform";
import Customer from "@/core/domain/models/Customer";


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

    const openCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
    
    const [searchName, setSearchName] = React.useState("");
    const [searchNationalId, setSearchNationalId] = React.useState("");
    const [searchPassport, setSearchPassport] = React.useState("");
    const [searchPhone, setSearchPhone] = React.useState("");

    const handleSave = (customer: Customer) => {
          window.location.reload();
    };

    return (
        <div>
          <section aria-label="CheckIn Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <InputWithLabel size="md" label="Guest Name" name="searchName" defaultValue={searchName} onBlur={(e) => setSearchName(e.target.value)} />
                <InputWithLabel size="md" label="National ID" name="searchNationalId" defaultValue={searchNationalId} onBlur={(e) => setSearchNationalId(e.target.value)} />
                <InputWithLabel size="md" label="Passport"  name="searchPassport" defaultValue={searchPassport} onBlur={(e) => setSearchPassport(e.target.value)} />
                <InputWithLabel size="md" label="Phone"  name="searchPhone" defaultValue={searchPhone} onBlur={(e) => setSearchPhone(e.target.value)} />
                <ButtonCustom variant={"black"} onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
                <ButtonCustom type="button" variant="green" onClick={() => { openCallbackFunc.current?.openDialog(true); }}>New Customer</ButtonCustom>
                
            </div>
          </section>
          <section className="flex">
          <CustomerNewForm openCallback={(func) => openCallbackFunc.current = func} onSaved={handleSave} />
        </section>
        </div>
    );
}
