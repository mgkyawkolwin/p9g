'use client';

import { Label } from "@/lib/components/web/react/ui/label";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { Textarea } from "../../../lib/components/web/react/ui/textarea";
import React from "react";
import Customer from "@/core/models/domain/Customer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { SelectListForm } from "@/core/constants";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";


interface CustomerDetailFormProps {
    customer: Customer;
    resetDataToggle: boolean;
    onDataChanged: (customer: Customer) => void;
}

export default function CustomerDetailForm({ customer, resetDataToggle, onDataChanged }: CustomerDetailFormProps) {


    const [localCustomer, setLocalCustomer] = React.useState<Customer>(customer);


    React.useEffect(() => {
        setLocalCustomer(new Customer());
    }, [resetDataToggle]);


    React.useEffect(() => {
        if (customer)
            setLocalCustomer(customer);
    }, [customer]);


    return (
        <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1">
            <InputWithLabel name="name" label="Name" variant="default" size={"full"} labelPosition="top" onBlur={() => onDataChanged(localCustomer)}
                value={localCustomer?.name ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, name: e.target.value }))} />
            <InputWithLabel name="englishName" label="English Name" variant="default" size={"full"} labelPosition="top" onBlur={() => onDataChanged(localCustomer)}
                value={localCustomer?.englishName ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, englishName: e.target.value }))} />
            <div className="flex gap-6 items-end">
                <div className="flex flex-col gap-2">
                <Label className="text-[10pt]">DOB</Label>
                <DatePicker className="flex"
                    selected={localCustomer?.dob ? new Date(localCustomer?.dob) : null}
                    onChange={(date: Date | null) => {
                        setLocalCustomer(prev => ({
                            ...prev,
                            dob: date ? date.toLocaleDateString() : ''
                        }));

                    }}
                    onBlur={() => onDataChanged(localCustomer)}
                    dateFormat="yyyy-MM-dd"
                    customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                    placeholderText="yyyy-mm-dd"
                    isClearable={true}
                    showIcon
                />
            </div>
            <SelectWithLabel name="gender" label="Gender" size="sm" labelPosition="top" items={SelectListForm.GENDER}
                value={localCustomer?.gender} onValueChange={value => {
                    setLocalCustomer(prev => ({ ...prev, gender: value }));
                    onDataChanged({...localCustomer, gender: value});
            }}
            />
            </div>
            <div className="flex gap-2">
                <InputWithLabel name="nationalId" label="National ID" labelPosition="top" size={"full"} onBlur={() => onDataChanged(localCustomer)}
                    value={localCustomer?.nationalId ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, nationalId: e.target.value }))} />
                <InputWithLabel name="passport" label="Passport" labelPosition="top" size={"full"} onBlur={() => onDataChanged(localCustomer)}
                    value={localCustomer?.passport ?? ''} onChange={(e) => {setLocalCustomer(prev => ({ ...prev, passport: e.target.value }))}} />
            </div>
            <div className="flex gap-2">
                <InputWithLabel name="phone" label="Phone" labelPosition="top" size={"full"} onBlur={() => onDataChanged(localCustomer)}
                    value={localCustomer?.phone ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, phone: e.target.value }))} />
                <InputWithLabel name="email" label="Email" labelPosition="top" size={"full"} onBlur={() => onDataChanged(localCustomer)}
                    value={localCustomer?.email ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, email: e.target.value }))} />
            </div>
            <InputWithLabel name="country" label="Country" labelPosition="top" size={"full"} onBlur={() => onDataChanged(localCustomer)}
                value={localCustomer?.country ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, country: e.target.value }))} />
            <Label htmlFor="address">Address</Label>
            <Textarea id="address" name="address" placeholder=" ..." value={localCustomer?.address ?? ''} onBlur={() => onDataChanged(localCustomer)}
                onChange={(e) => setLocalCustomer(prev => ({ ...prev, address: e.target.value }))} />
            <Label htmlFor="remarks">Remarks</Label>
            <Textarea id="remarks" name="remarks" placeholder=" ..." value={localCustomer?.remarks ?? ''} onBlur={() => onDataChanged(localCustomer)}
                onChange={(e) => setLocalCustomer(prev => ({ ...prev, remarks: e.target.value }))} />

        </div>
    );
};