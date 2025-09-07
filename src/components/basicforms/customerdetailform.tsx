'use client';

import { Label } from "@/components/ui/label";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { Textarea } from "../ui/textarea";
import React from "react";
import Customer from "@/core/domain/models/Customer";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputCustom } from "../uicustom/inputcustom";


interface CustomerDetailFormProps {
    customer: Customer;
    resetDataToggle: boolean;
    onDataChanged: (customer: Customer) => void;
}

export default function CustomerDetailForm({ customer, resetDataToggle, onDataChanged }: CustomerDetailFormProps) {
    

    const [localCustomer, setLocalCustomer] = React.useState(customer);


    React.useEffect(() => {
        setLocalCustomer(new Customer());
    }, [resetDataToggle]);


    React.useEffect(() => {
        if (customer)
            setLocalCustomer(customer);
    }, [customer]);


    return (
        <div className="flex flex-col gap-4">
            <InputWithLabel name="name" label="Name" variant="default" size={"full"} labelPosition="top" onBlur={() => onDataChanged(localCustomer)}
                value={localCustomer?.name ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, name: e.target.value }))} />
            <InputWithLabel name="englishName" label="English Name" variant="default" size={"full"} labelPosition="top" onBlur={() => onDataChanged(localCustomer)}
                value={localCustomer?.englishName ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, englishName: e.target.value }))} />
            <div className="flex flex-col gap-2">
                <Label className="text-[10pt]">DOB</Label>
                <DatePicker
                    selected={localCustomer?.dob ? new Date(localCustomer?.dob) : null}
                    onChange={(date: Date | null) => {
                        setLocalCustomer(prev => ({
                            ...prev,
                            dob: date.toLocaleDateString()
                        }));

                    }}
                    onBlur={() => onDataChanged(localCustomer)}
                    dateFormat="yyyy-MM-dd"
                    customInput={<InputCustom variant="form" size="md" />} // Uses shadcn/ui Input
                    placeholderText="yyyy-mm-dd"
                    isClearable={true}
                    showIcon
                />
            </div>
            <div className="flex gap-2">
                <InputWithLabel name="nationalId" label="National ID" labelPosition="top" size={"full"} onBlur={() => onDataChanged(localCustomer)}
                    value={localCustomer?.nationalId ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, nationalId: e.target.value }))} />
                <InputWithLabel name="passport" label="Passport" labelPosition="top" size={"full"} onBlur={() => onDataChanged(localCustomer)}
                    value={localCustomer?.passport ?? ''} onChange={(e) => setLocalCustomer(prev => ({ ...prev, passport: e.target.value }))} />
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

        </div>
    );
};