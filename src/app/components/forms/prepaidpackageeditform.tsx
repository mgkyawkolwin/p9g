'use client';

import React from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import Customer from "@/core/models/domain/Customer";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";
import Config from "@/core/models/domain/Config";

import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { Label } from "@/lib/components/web/react/ui/label";

import PrepaidPackageDetailForm from "@/app/components/basicforms/prepaidpackagedetailform";
import CustomerChooseTable from "@/app/components/tables/customerchoosetable";
import { prepaidPackageTypeGetList, prepaidPackageUpdate, searchCustomer } from "@/app/(private)/[location]/console/packages/new/actions";


interface PrepaidPackageEditFormProps {
  onSaved?: (prepaidPackage: PrepaidPackage) => void;
  openCallback?: (func: {
    openDialog: (open: boolean) => void;
    setEditPrepaidPackage: (prepaidPackage: PrepaidPackage) => void;
  }) => void;
}


export default function PrepaidPackageEditForm({ onSaved, openCallback }: PrepaidPackageEditFormProps) {
  const params = useParams();
  const location = params.location as string;

  const [open, setOpen] = React.useState(false);
  const [openChooseCustomerDialog, setOpenChooseCustomerDialog] = React.useState(false);
  const [searchCustomerName, setSearchCustomerName] = React.useState('');
  const [customerList, setCustomerList] = React.useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = React.useState<Customer[]>([]);
  const [packageTypeItems, setPackageTypeItems] = React.useState<Map<string, string>>(new Map([['DEFAULT', 'Choose']]));
  const [prepaidPackage, setPrepaidPackage] = React.useState<PrepaidPackage>(new PrepaidPackage());

  const openDialog = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      setOpenChooseCustomerDialog(false);
      setCustomerList([]);
      setSelectedCustomers([]);
      setSearchCustomerName('');
    }
  }, []);

  const setEditPrepaidPackage = React.useCallback((item: PrepaidPackage) => {
    setPrepaidPackage({ ...item });
    setSelectedCustomers([]);
  }, []);

  React.useEffect(() => {
    openCallback?.({ openDialog, setEditPrepaidPackage });
  }, [openCallback, openDialog, setEditPrepaidPackage]);

  React.useEffect(() => {
    async function loadPackageTypes() {
      const result = await prepaidPackageTypeGetList(location);
      if (result.error) {
        if (result.message) toast(result.message);
        return;
      }

      const items = new Map<string, string>([['DEFAULT', 'Choose']]);
      const packageTypes = (result.data ?? []) as Config[];
      packageTypes.forEach((item) => items.set(item.id, item.text));
      setPackageTypeItems(items);
    }

    if (open) loadPackageTypes();
  }, [open, location]);

  const handleCustomerChosen = (customer: Customer) => {
    setSelectedCustomers([customer]);
    setPrepaidPackage((previous) => ({
      ...previous,
      customerId: customer.id,
      customerName: customer.name,
      customerEnglishName: customer.englishName,
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={openDialog}>
        <DialogContent className="h-auto w-auto min-w-[900px]">
          <DialogHeader>
            <DialogTitle>Edit Package</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="flex flex-col gap-4">
            <PrepaidPackageDetailForm
              prepaidPackage={prepaidPackage}
              packageTypeItems={packageTypeItems}
              onDataChanged={setPrepaidPackage}
              onCustomerChooseRequested={() => setOpenChooseCustomerDialog(true)}
            />

            <div className="flex gap-4">
              <ButtonCustom
                type="button"
                variant="green"
                onClick={async () => {
                  const result = await prepaidPackageUpdate(prepaidPackage, location);
                  if (result.message) toast(result.message);
                  if (result.error) return;

                  onSaved?.(result.data as PrepaidPackage);
                  openDialog(false);
                }}
              >
                Update Package
              </ButtonCustom>
              <ButtonCustom type="button" variant="black" onClick={() => openDialog(false)}>Close</ButtonCustom>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={openChooseCustomerDialog} onOpenChange={setOpenChooseCustomerDialog}>
        <DialogContent className="flex min-w-[90vw] flex-col p-8 gap-4">
          <DialogHeader>
            <DialogTitle>Search Customer</DialogTitle>
            <DialogDescription />
          </DialogHeader>

          <div className="flex items-center gap-2">
            <Label>Search</Label>
            <InputCustom size="lg" value={searchCustomerName} onChange={(event) => setSearchCustomerName(event.target.value)} />
            <ButtonCustom
              type="button"
              variant="black"
              onClick={async () => {
                const result = await searchCustomer(searchCustomerName, location);
                if (result.error) {
                  toast(result.message);
                  return;
                }
                setCustomerList((result.data ?? []) as Customer[]);
              }}
            >
              Search Customer
            </ButtonCustom>
          </div>

          <CustomerChooseTable
            data={customerList}
            selectedCustomers={selectedCustomers}
            setSelectedCustomers={setSelectedCustomers}
            setOpen={setOpenChooseCustomerDialog}
            onCustomerChosen={handleCustomerChosen}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
