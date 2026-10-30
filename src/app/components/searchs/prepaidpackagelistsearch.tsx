"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import PrepaidEntity from "@/core/models/entity/PrepaidEntity";
import { SelectListSearch } from "@/core/constants";
import { prepaidPackageTypeGetList } from "@/app/(private)/[location]/console/packages/new/actions";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";
import { Label } from "@/lib/components/web/react/ui/label";

interface PackageListSearchProps {
  formRef?: React.RefObject<HTMLFormElement | null>;
}

export default function PrepaidPackageListSearch({ formRef }: PackageListSearchProps) {
  const params = useParams();
  const location = params.location as string;
  const [packageTypeId, setPackageTypeId] = React.useState("DEFAULT");
  const [paymentStatus, setPaymentStatus] = React.useState("DEFAULT");
  const [packageStatus, setPackageStatus] = React.useState("DEFAULT");
  const [searchId, setSearchId] = React.useState("");
  const [searchRemark, setSearchRemark] = React.useState("");
  const [effectiveFrom, setEffectiveFrom] = React.useState<Date | null>(null);
  const [effectiveUntil, setEffectiveUntil] = React.useState<Date | null>(null);
  const [packageTypeItems, setPackageTypeItems] = React.useState<Map<string, string>>(
    new Map([["DEFAULT", "Show All"]])
  );

  React.useEffect(() => {
    async function loadPackageTypes() {
      const result = await prepaidPackageTypeGetList(location);
      if (result.error) return;

      const items = new Map<string, string>([["DEFAULT", "Show All"]]);
      ((result.data ?? []) as PrepaidEntity[]).forEach((item) => items.set(item.id, item.text));
      setPackageTypeItems(items);
    }

    loadPackageTypes();
  }, [location]);

  return (
    <section aria-label="Package list search" className="flex w-full flex-col gap-4">
      <div className="flex flex-wrap items-end gap-4">
        <SelectWithLabel
          label="Package Type"
          labelPosition="top"
          items={packageTypeItems}
          value={packageTypeId}
          onValueChange={setPackageTypeId}
        />
        <SelectWithLabel
          label="Payment Status"
          labelPosition="top"
          items={SelectListSearch.PACKAGE_PAYMENT_STATUS}
          value={paymentStatus}
          onValueChange={setPaymentStatus}
        />
        <SelectWithLabel
          label="Package Status"
          labelPosition="top"
          items={SelectListSearch.PACKAGE_STATUS}
          value={packageStatus}
          onValueChange={setPackageStatus}
        />
        <InputWithLabel labelPosition="top" size="md" name="searchId" label="Package ID" value={searchId} onChange={(e) => setSearchId(e.target.value)} />
        <InputWithLabel labelPosition="top" size="md" name="searchRemark" label="Remark" value={searchRemark} onChange={(e) => setSearchRemark(e.target.value)} />
        <div className="flex flex-col gap-1">
          <Label>Effective From</Label>
          <DatePicker
            selected={effectiveFrom}
            onChange={setEffectiveFrom}
            dateFormat="yyyy-MM-dd"
            customInput={<InputCustom size="md" />}
            placeholderText="yyyy-mm-dd"
            isClearable
            showIcon
          />
          <input
            type="hidden"
            name="searchEffectiveFrom"
            value={effectiveFrom?.toLocaleDateString("sv-SE") ?? ""}
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label>Effective Until</Label>
          <DatePicker
            selected={effectiveUntil}
            onChange={setEffectiveUntil}
            dateFormat="yyyy-MM-dd"
            customInput={<InputCustom size="md" />}
            placeholderText="yyyy-mm-dd"
            isClearable
            showIcon
          />
          <input
            type="hidden"
            name="searchEffectiveUntil"
            value={effectiveUntil?.toLocaleDateString("sv-SE") ?? ""}
          />
        </div>
        <input type="hidden" name="searchPrepaidPackageTypeId" value={packageTypeId} />
        <input type="hidden" name="searchPaymentStatus" value={paymentStatus} />
        <input type="hidden" name="searchPackageStatus" value={packageStatus} />
        <ButtonCustom type="button" onClick={() => formRef?.current?.requestSubmit()}>
          Search
        </ButtonCustom>
      </div>
    </section>
  );
}