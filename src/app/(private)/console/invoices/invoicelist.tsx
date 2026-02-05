"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import InvoiceListTable from "@/app/components/tables/invoicelisttable";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import InvoiceListSearch from "@/app/components/searchs/invoicelistsearch";
import { invoiceGetList } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import InvoiceDialog from "@/app/components/dialogs/invoicedialog";


export default function InvoiceList() {

  const formRef = React.useRef<HTMLFormElement>(null);
  const [openNewDialog, setOpenNewDialog] = React.useState(false);

  const [state, formAction, isPending] = useActionState(invoiceGetList, {
    error: false,
    message: ""
  });

  useEffect(() => {
    if (state.error) {
      toast(state.message);
    }
  }, [state]);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex w-full">
        <GroupTitle>
          Invoice List
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
              <div></div>
              <ButtonCustom 
                type="button" 
                variant={"green"} 
                size={"default"}
                onClick={() => setOpenNewDialog(true)}
              >
                New Invoice
              </ButtonCustom>
            </div>
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <InvoiceListSearch formRef={formRef} />
              <InvoiceListTable formState={state} formAction={formAction} formRef={formRef} />
            </form>
          </div>
        </GroupContent>
      </Group>
      <InvoiceDialog isNew={true} isOpen={openNewDialog} formRef={formRef} onOpenChanged={() => setOpenNewDialog(false)} />
    </div>
  );
}
