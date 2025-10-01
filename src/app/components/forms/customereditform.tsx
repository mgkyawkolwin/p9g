'use client';

import React from "react";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { toast } from "sonner";
import Customer from "@/core/models/domain/Customer";
import CustomerDetailForm from "../basicforms/customerdetailform";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import { customerUpdate } from "@/app/(private)/console/customers/[id]/edit/actions";

interface CustomerEditFormProps {
    onSaved?: (customer: Customer) => void;
    openCallback?: (func: {
        openDialog: (open: boolean) => void;
        setEditCustomer: (customer:Customer) => void;
    }) => void;
}

export default function CustomerEditForm({ onSaved, openCallback }: CustomerEditFormProps) {
    
    const [resetDataToggle, setResetDataToggle] = React.useState(false);
    const [customer, setCustomer] = React.useState(new Customer());
    const [open, setOpen] = React.useState(false);


    const handleDataChanged = (customer: Customer) => {
        setCustomer(customer);
    };

    const openDialog = (open: boolean) => {
        setOpen(open);
    };

    const setEditCustomer = (customer: Customer) => {
        setCustomer(customer);
    };

    React.useEffect(() => {
        if (openCallback) {
            openCallback({ openDialog, setEditCustomer });
        }
    }, [openCallback]);


    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="h-auto w-auto">
                <DialogHeader>
                    <DialogTitle>Edit Customer</DialogTitle>
                    <DialogDescription>
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col gap-4">
                    <CustomerDetailForm onDataChanged={handleDataChanged} resetDataToggle={resetDataToggle} customer={customer} />
                    <div className="flex gap-4">
                        <ButtonCustom type="button" variant={"green"} onClick={async () => {
                            const result = await customerUpdate(customer);
                            if(result.error){
                                toast(result.message);
                            }else{
                                if(onSaved)
                                    onSaved(customer);
                                setOpen(false);
                            }
                        }} >Update Customer</ButtonCustom>
                        <ButtonCustom type="button" variant={"black"} onClick={() => setOpen(false)}>Close</ButtonCustom>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};