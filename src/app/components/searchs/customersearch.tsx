
import * as React from "react";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { FormState } from "@/core/types";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import CustomerNewForm from "../forms/customernewform";
import Customer from "@/core/models/domain/Customer";
import { CheckboxCustom } from "@/lib/components/web/react/uicustom/CheckboxCustom";
import { Checkbox } from "@/lib/components/web/react/ui/checkbox";

const initialData = {
    searchId: "",
    searchName: "",
    searchNationalId: "",
    searchPassport: "",
    searchPhone: "",
    showBlackListOnly: false,
    showDeleted: false
};

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
    
    const [searchId, setSearchId] = React.useState(initialData.searchId);
    const [searchName, setSearchName] = React.useState(initialData.searchName);
    const [searchNationalId, setSearchNationalId] = React.useState(initialData.searchNationalId);
    const [searchPassport, setSearchPassport] = React.useState(initialData.searchPassport);
    const [searchPhone, setSearchPhone] = React.useState(initialData.searchPhone);
    const [isShowBlackListOnly, setIsShowBlackListOnly] = React.useState(initialData.showBlackListOnly);
    const [isShowDeleted, setIsShowDeleted] = React.useState(initialData.showDeleted);

    const handleSave = (customer: Customer) => {
          window.location.reload();
    };

    return (
        <div>
          <section aria-label="CheckIn Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4">
                <InputWithLabel size="md" label="Id" name="searchId" defaultValue={searchId} onBlur={(e) => setSearchId(e.target.value)} />
                <InputWithLabel size="md" label="Guest Name" name="searchName" defaultValue={searchName} onBlur={(e) => setSearchName(e.target.value)} />
                <InputWithLabel size="md" label="National ID" name="searchNationalId" defaultValue={searchNationalId} onBlur={(e) => setSearchNationalId(e.target.value)} />
                <InputWithLabel size="sm" label="Passport"  name="searchPassport" defaultValue={searchPassport} onBlur={(e) => setSearchPassport(e.target.value)} />
                <InputWithLabel size="sm" label="Phone"  name="searchPhone" defaultValue={searchPhone} onBlur={(e) => setSearchPhone(e.target.value)} />
                <ButtonCustom variant={"black"} onClick={() => formRef?.current?.requestSubmit()}>Search</ButtonCustom>
                <ButtonCustom type="button" variant="green" onClick={() => { openCallbackFunc.current?.openDialog(true); }}>New Customer</ButtonCustom>
            </div>
            <div className="flex gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Checkbox id="showBlackListOnly" name="xxx" checked={isShowBlackListOnly} onCheckedChange={(checked:boolean) => setIsShowBlackListOnly(checked)} />
                  <label htmlFor="showBlackListOnly">Show Blacklist Customers</label>
                </div>
                <div className="flex items-center gap-2">
                  <Checkbox id="showDeleted" name="xx" checked={isShowDeleted} onCheckedChange={(checked:boolean) => setIsShowDeleted(checked)} />
                  <label htmlFor="showDeleted">Show Deleted Customers</label>
                  <input type="hidden" name="searchIsBlackListed" value={String(isShowBlackListOnly)} />
                  <input type="hidden" name="searchIsDeleted" value={String(isShowDeleted)} />
                </div>
            </div>
          </section>
          <section className="flex">
            <CustomerNewForm openCallback={(func) => openCallbackFunc.current = func} onSaved={handleSave} />
          </section>
        </div>
    );
}
