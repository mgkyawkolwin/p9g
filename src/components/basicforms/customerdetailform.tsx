'use client';

import { Label } from "@/components/ui/label";
import { InputWithLabel } from "../uicustom/inputwithlabel";
import { Textarea } from "../ui/textarea";
import React from "react";
import { DateInputWithLabel } from "../uicustom/dateinputwithlabel";
import c from "@/lib/core/logger/ConsoleLogger";
import Customer from "@/domain/models/Customer";


interface CustomerDetailFormProps {
    customer: Customer;
    resetDataToggle: boolean;
    onDataChanged: (customer: Customer) => void;
}

export default function CustomerDetailForm({ customer, resetDataToggle, onDataChanged }: CustomerDetailFormProps) {
    c.i('Client > CustomerDetailForm');

    const [localCustomer, setLocalCustomer] = React.useState(customer);

    // React.useEffect(() => {
    //     onDataChanged(localCustomer);
    // }, [localCustomer]);


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
            <DateInputWithLabel label="Date of birth" labelPosition="top" type="date" variant={"date"} size={"sm"}
                value={localCustomer?.dob ? new Date(localCustomer?.dob).toLocaleDateString('sv-SE') : ''} onBlur={() => onDataChanged(localCustomer)}
                onChange={(e) => { setLocalCustomer(prev => ({ ...prev, dob: new Date(e.target.value).toLocaleDateString('sv-SE') })); }} />
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