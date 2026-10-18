'use client';

import React from "react";
import PrepaidPackage from "@/core/models/domain/PrepaidPackage";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";
import { Textarea } from "@/lib/components/web/react/ui/textarea";
import { Label } from "@/lib/components/web/react/ui/label";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";


interface PrepaidPackageDetailFormProps {
  prepaidPackage: PrepaidPackage;
  packageTypeItems: Map<string, string>;
  onDataChanged: (prepaidPackage: PrepaidPackage) => void;
  onCustomerChooseRequested: () => void;
}

export default function PrepaidPackageDetailForm({
  prepaidPackage,
  packageTypeItems,
  onDataChanged,
  onCustomerChooseRequested
}: PrepaidPackageDetailFormProps) {

  const localData = prepaidPackage;

  return (
    <div className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto p-1">
      <SelectWithLabel
        name="prepaidPackageTypeId"
        label="Package Type"
        size="full"
        labelPosition="top"
        items={packageTypeItems}
        value={localData.prepaidPackageTypeId || 'DEFAULT'}
        onValueChange={(value) => {
          onDataChanged({ ...localData, prepaidPackageTypeId: value === 'DEFAULT' ? '' : value });
        }}
      />

      <div>
        <button type="button" className="px-3 py-2 text-sm rounded-md border" onClick={onCustomerChooseRequested}>Search and Choose Customer</button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
        <InputWithLabel
          name="customerId"
          label="Customer Id"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.customerId ?? ''}
          readOnly
          disabled
        />
        <InputWithLabel
          name="customerName"
          label="Customer Name"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.customerName ?? ''}
          readOnly
          disabled
        />
        <InputWithLabel
          name="customerEnglishName"
          label="Customer English Name"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.customerEnglishName ?? ''}
          readOnly
          disabled
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div className="flex min-w-0 flex-col gap-2 w-full">
          <Label className="text-[10pt]">Effective Start Date</Label>
          <DatePicker
            selected={localData.effectiveStartDate ? new Date(localData.effectiveStartDate) : null}
            onChange={(date: Date | null) => {
              onDataChanged({ ...localData, effectiveStartDate: date ?? null });
            }}
            dateFormat="yyyy-MM-dd"
            customInput={<InputCustom size="md" />}
            placeholderText="yyyy-mm-dd"
            isClearable
            showIcon
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2 w-full">
          <Label className="text-[10pt]">Effective End Date</Label>
          <DatePicker
            selected={localData.effectiveEndDate ? new Date(localData.effectiveEndDate) : null}
            onChange={(date: Date | null) => {
              onDataChanged({ ...localData, effectiveEndDate: date ?? null });
            }}
            dateFormat="yyyy-MM-dd"
            customInput={<InputCustom size="md" />}
            placeholderText="yyyy-mm-dd"
            isClearable
            showIcon
          />
        </div>
        <InputWithLabel
          name="noOfDays"
          label="No of Days"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.noOfDays ?? 0}
          onChange={(e) => onDataChanged({ ...localData, noOfDays: Number(e.target.value || 0) })}
        />
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <InputWithLabel
          name="deposit"
          label="Deposit"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.deposit ?? 0}
          onChange={(e) => {
            const deposit = Number(e.target.value || 0);
            onDataChanged({ ...localData, deposit, balance: Number(localData.price || 0) - deposit });
          }}
        />
        <div className="flex flex-col gap-2 w-full">
          <Label className="text-[10pt]">Deposit Date</Label>
          <DatePicker
            selected={localData.depositDateTimeUTC ? new Date(localData.depositDateTimeUTC) : null}
            onChange={(date: Date | null) => {
              onDataChanged({ ...localData, depositDateTimeUTC: date ?? null });
            }}
            dateFormat="yyyy-MM-dd HH:mm"
            customInput={<InputCustom size="md" />}
            placeholderText="yyyy-mm-dd hh:mm"
            isClearable
            showIcon
            showTimeSelect
            timeIntervals={5}
            timeFormat="HH:mm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <InputWithLabel
          name="price"
          label="Price"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.price ?? 0}
          onChange={(e) => {
            const price = Number(e.target.value || 0);
            onDataChanged({ ...localData, price, balance: price - Number(localData.deposit || 0) });
          }}
        />
        <InputWithLabel
          name="balance"
          label="Balance Amount"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.balance ?? 0}
          readOnly
        />
      </div>

      <Label htmlFor="remark">Remark</Label>
      <Textarea
        id="remark"
        name="remark"
        placeholder=" ..."
        value={localData.remark ?? ''}
        onChange={(e) => onDataChanged({ ...localData, remark: e.target.value })}
      />
    </div>
  );
}
