'use client';

import React from "react";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";
import c from "@/lib/core/logger/ConsoleLogger";
import { ButtonCustom } from "../uicustom/buttoncustom";
import { saveReservationAction } from "@/app/(private)/console/reservations/new/actions";
import { toast } from "sonner";
import Customer from "@/domain/models/Customer";
import CustomerDetailForm from "../basicforms/customerdetailform";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog";
import { customerCreate } from "@/app/(private)/console/customers/new/actions";

interface CustomerNewFormProps {
    onSaved?: (customer: Customer) => void;
    openCallback?: (func: {
        openDialog: (open: boolean) => void;
    }) => void;
}

export default function CustomerNewForm({ onSaved, openCallback }: CustomerNewFormProps) {
    c.i('Client > CustomerNewForm');


    const [resetDataToggle, setResetDataToggle] = React.useState(false);
    const [customer, setCustomer] = React.useState(new Customer());
    const [open, setOpen] = React.useState(false);


    const handleDataChanged = (customer: Customer) => {
        setCustomer(customer);
    };

    const openDialog = (open: boolean) => {
        setOpen(open);
    };

    React.useEffect(() => {
        if (openCallback) {
            openCallback({ openDialog });
        }
    }, [openCallback]);


    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="h-auto w-auto">
                <DialogHeader>
                    <DialogTitle>New Customer</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <CustomerDetailForm onDataChanged={handleDataChanged} resetDataToggle={resetDataToggle} customer={customer} />
                    <div className="flex gap-4">
                        <ButtonCustom type="button" variant={"green"} onClick={async () => {
                            const result = await customerCreate(customer);
                            if(result.error){
                                toast(result.message);
                            }else{
                                if(onSaved)
                                    onSaved(result.data);
                                setOpen(false);
                            }
                        }} >Create Customer</ButtonCustom>
                        <ButtonCustom type="button" variant={"red"} onClick={() => setResetDataToggle(prev => !prev)}>Clear Form</ButtonCustom>
                        <ButtonCustom type="button" variant={"black"} onClick={() => setOpen(false)}>Close</ButtonCustom>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};