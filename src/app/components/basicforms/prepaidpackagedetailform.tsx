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
  const calculatedBalance = Number(localData.price ?? 0) - Number(localData.paidAmount ?? 0);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Row 1: Package Type */}
      <div className="grid grid-cols-2 gap-4 w-full">
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
      </div>

      {/* Customer Selection */}
      <div>
        <button type="button" className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-50" onClick={onCustomerChooseRequested}>
          Search and Choose Customer
        </button>
      </div>

      {/* Row 2: Customer Information */}
      <div className="grid grid-cols-3 gap-4">
        <InputWithLabel
          name="customerId"
          label="Customer ID"
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
          label="English Name"
          variant="default"
          size="full"
          labelPosition="top"
          value={localData.customerEnglishName ?? ''}
          readOnly
          disabled
        />
      </div>

      {/* Row 3: Effective Dates and Days */}
      <div className="grid grid-cols-4 gap-4">
        <div className="flex min-w-0 flex-col gap-2 w-full">
          <Label className="text-sm font-medium">Effective Start Date</Label>
          <DatePicker
            selected={localData.effectiveStartDate ? localData.effectiveStartDate.getUTCDateTimeAsLocalDateTime() : null}
            onChange={(date: Date | null) => {
              onDataChanged({
                ...localData,
                effectiveStartDate: date ? date.getLocalDateAsUTCDate() : null
              });
            }}
            maxDate={localData.effectiveEndDate ? new Date(localData.effectiveEndDate) : undefined}
            dateFormat="yyyy-MM-dd"
            customInput={<InputCustom size="md" />}
            placeholderText="yyyy-mm-dd"
            isClearable
            showIcon
          />
        </div>

        <div className="flex min-w-0 flex-col gap-2 w-full">
          <Label className="text-sm font-medium">Effective End Date</Label>
          <DatePicker
            selected={localData.effectiveEndDate ? localData.effectiveEndDate.getUTCDateTimeAsLocalDateTime() : null}
            onChange={(date: Date | null) => {
              onDataChanged({
                ...localData,
                effectiveEndDate: date ? date.getLocalDateAsUTCDate() : null
              });
            }}
            minDate={localData.effectiveStartDate ? localData.effectiveStartDate.getUTCDateTimeAsLocalDateTime() : undefined}
            dateFormat="yyyy-MM-dd"
            customInput={<InputCustom size="md" />}
            placeholderText="yyyy-mm-dd"
            isClearable
            showIcon
          />
        </div>
        <InputWithLabel
          name="noOfDays"
          label="Total Days"
          variant="default"
          size="full"
          labelPosition="top"
          type="text"
          inputMode="numeric"
          value={localData.noOfDays ?? 0}
          onChange={(e) => {
            const noOfDays = Number(e.target.value.replace(/\D/g, '')) || 0;
            onDataChanged({ ...localData, noOfDays });
          }}
        />
        <InputWithLabel
          name="daysUsed"
          label="Days Used"
          variant="default"
          size="full"
          labelPosition="top"
          type="number"
          value={localData.daysUsed ?? 0}
          readOnly
          disabled
        />
      </div>

      {/* Row 4: Total Price, Paid Amount, and Balance */}
      <div className="grid grid-cols-3 gap-4">
        <InputWithLabel
          name="price"
          label="Total Price"
          variant="default"
          size="full"
          labelPosition="top"
          type="text"
          inputMode="numeric"
          value={localData.price ?? 0}
          onChange={(e) => {
            const price = Number(e.target.value.replace(/\D/g, '')) || 0;
            onDataChanged({ ...localData, price, balance: price - Number(localData.paidAmount ?? 0) });
          }}
        />
        <InputWithLabel
          name="paidAmount"
          label="Paid Amount"
          variant="default"
          size="full"
          labelPosition="top"
          type="number"
          value={localData.paidAmount ?? 0}
          readOnly
          disabled
        />
        <InputWithLabel
          name="balance"
          label="Balance Amount"
          variant="default"
          size="full"
          labelPosition="top"
          type="number"
          value={calculatedBalance}
          readOnly
          disabled
        />
      </div>

      {/* Remark - Full Width */}
      <div className="flex flex-col gap-2">
        <Label htmlFor="remark" className="text-sm font-medium">Remark</Label>
        <Textarea
          id="remark"
          name="remark"
          placeholder="Enter any additional notes..."
          value={localData.remark ?? ''}
          onChange={(e) => onDataChanged({ ...localData, remark: e.target.value })}
          className="min-h-[80px]"
        />
      </div>
    </div>
  );
}
