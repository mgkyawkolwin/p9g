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
import { prepaidPackageCreate, prepaidPackageTypeGetList, searchCustomer } from "@/app/(private)/[location]/console/packages/new/actions";


interface PrepaidPackageNewFormProps {
  onSaved?: (prepaidPackage: PrepaidPackage) => void;
  openCallback?: (func: {
    openDialog: (open: boolean) => void;
  }) => void;
}


export default function PrepaidPackageNewForm({ onSaved, openCallback }: PrepaidPackageNewFormProps) {
  const params = useParams();
  const location = params.location as string;

  const [open, setOpen] = React.useState(false);
  const [openChooseCustomerDialog, setOpenChooseCustomerDialog] = React.useState(false);
  const [searchCustomerName, setSearchCustomerName] = React.useState('');
  const [customerList, setCustomerList] = React.useState<Customer[]>([]);
  const [selectedCustomers, setSelectedCustomers] = React.useState<Customer[]>([]);
  const [packageTypeItems, setPackageTypeItems] = React.useState<Map<string, string>>(new Map([['DEFAULT', 'Choose']]));

  const [prepaidPackage, setPrepaidPackage] = React.useState<PrepaidPackage>({
    ...new PrepaidPackage(),
    modelState: 'inserted'
  });

  const resetData = React.useCallback(() => {
    setPrepaidPackage({ ...new PrepaidPackage(), modelState: 'inserted' });
    setSelectedCustomers([]);
    setSearchCustomerName('');
    setCustomerList([]);
  }, []);

  const openDialog = React.useCallback((isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen) {
      resetData();
    }
  }, [resetData]);

  React.useEffect(() => {
    if (openCallback) {
      openCallback({ openDialog });
    }
  }, [openCallback, openDialog]);

  React.useEffect(() => {
    async function loadPackageTypes() {
      const result = await prepaidPackageTypeGetList(location);
      if (result.error) {
        if (result.message) toast(result.message);
        return;
      }

      const items = new Map<string, string>([['DEFAULT', 'Choose']]);
      const packageTypes = (result.data ?? []) as Config[];
      packageTypes.forEach((x) => items.set(x.id, x.text));
      setPackageTypeItems(items);
    }

    if (open) {
      loadPackageTypes();
    }
  }, [open, location]);

  const handleCustomerChosen = (customer: Customer) => {
    setSelectedCustomers([customer]);
    setPrepaidPackage(prev => ({
      ...prev,
      customerId: customer.id,
      customerName: customer.name,
      customerEnglishName: customer.englishName,
    }));
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="h-auto w-auto min-w-[900px]">
          <DialogHeader>
            <DialogTitle>New Package</DialogTitle>
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
                  const result = await prepaidPackageCreate(prepaidPackage, location);
                  if (result.error) {
                    toast(result.message);
                    return;
                  }

                  if (onSaved) onSaved(result.data as PrepaidPackage);
                  setOpen(false);
                }}
              >
                Create Package
              </ButtonCustom>

              <ButtonCustom type="button" variant="red" onClick={resetData}>Clear Form</ButtonCustom>
              <ButtonCustom type="button" variant="black" onClick={() => setOpen(false)}>Close</ButtonCustom>
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
            <InputCustom size="lg" value={searchCustomerName} onChange={(e) => setSearchCustomerName(e.target.value)} />
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
