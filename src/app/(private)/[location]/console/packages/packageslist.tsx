"use client";

import React, { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { useParams } from 'next/navigation';
import { prepaidPackageGetList } from "./actions";
import PrepaidPackageTable from "@/app/components/tables/prepaidpackagetable";
import PrepaidPackageNewForm from "@/app/components/forms/prepaidpackagenewform";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import PrepaidPackageListSearch from "@/app/components/searchs/prepaidpackagelistsearch";

const asDate = (value: Date | string | null | undefined): Date | null | undefined => {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (value instanceof Date) return value;
  return new Date(value);
};

export default function PackagesList() {
  const formRef = React.useRef<HTMLFormElement>(null);
  const openCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
  const params = useParams();

  const [state, formAction, isPending] = useActionState(prepaidPackageGetList, {
    error: false,
    message: ""
  });

  useEffect(() => {
    if (state.message) {
      toast(state.message);
    }
  }, [state]);

  const handleSaved = (_prepaidPackage: PrepaidPackage) => {
    formRef.current?.requestSubmit();
  };

  const packageListState = {
    ...state,
    data: Array.isArray(state.data)
      ? state.data.map((item: PrepaidPackage) => ({
          ...item,
          effectiveStartDate: asDate(item.effectiveStartDate),
          effectiveEndDate: asDate(item.effectiveEndDate),
          createdAtUTC: asDate(item.createdAtUTC),
          updatedAtUTC: asDate(item.updatedAtUTC)
        }))
      : state.data
  };

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex flex-1 w-auto">
        <GroupTitle>
          Packages List
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <div className="flex">
                <ButtonCustom type="button" variant="green" onClick={() => openCallbackFunc.current?.openDialog(true)}>
                  New Package
                </ButtonCustom>
              </div>
              <PrepaidPackageListSearch formRef={formRef} />
              <PrepaidPackageTable formState={packageListState} formAction={formAction} formRef={formRef} />
              <input type="hidden" name="location" value={params.location} />
            </form>
            <PrepaidPackageNewForm openCallback={(func) => openCallbackFunc.current = func} onSaved={handleSaved} />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}