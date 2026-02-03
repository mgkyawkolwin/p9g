"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { SelectCustom } from "@/lib/components/web/react/uicustom/selectcustom";
import { Textarea } from "@/lib/components/web/react/ui/textarea";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Label } from "@/lib/components/web/react/ui/label";
import Invoice from "@/core/models/domain/Invoice";
import { invoiceCreate } from "../actions";
import { toast } from "sonner";
import { Loader } from "@/lib/components/web/react/uicustom/loader";

export default function InvoiceNew() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Invoice>>({
    invoiceNumber: '',
    invoiceDate: new Date(),
    agentName: '',
    customerName: '',
    pax: '',
    depositKWR: 0,
    depositTHB: 0,
    totalAmountKWR: 0,
    totalAmountTHB: 0,
    dueAmountKWR: 0,
    dueAmountTHB: 0,
    status: 'DRAFT',
    included: '',
    notIncluded: '',
    simpleItems: [],
    bookingItems: []
  });

  const invoiceStatusItems = new Map<string, string>([
    ["DRAFT", "Draft"],
    ["SENT", "Sent"],
    ["PAID", "Paid"],
    ["OVERDUE", "Overdue"],
    ["CANCELLED", "Cancelled"]
  ]);

  const currencyItems = new Map<string, string>([
    ["KWR", "KWR"],
    ["USD", "USD"],
    ["THB", "THB"],
    ["MMK", "MMK"]
  ]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    if (!formData.invoiceNumber) {
      toast.error("Invoice number is required");
      return;
    }

    if (!formData.customerName) {
      toast.error("Customer name is required");
      return;
    }

    setIsLoading(true);
    const result = await invoiceCreate(formData as Invoice);
    setIsLoading(false);

    if (result.error) {
      toast.error(result.message);
    } else {
      toast.success(result.message);
      router.push("/console/invoices");
    }
  };

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isLoading} />
      <Group className="flex w-full">
        <GroupTitle>
          Create New Invoice
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label>Invoice Number *</Label>
                <InputCustom
                  size="md"
                  placeholder="Enter invoice number"
                  value={formData.invoiceNumber || ''}
                  onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Invoice Date</Label>
                <DatePicker
                  selected={formData.invoiceDate}
                  onChange={(date: Date | null) => handleInputChange("invoiceDate", date)}
                  dateFormat="yyyy-MM-dd"
                  customInput={<InputCustom size="md" />}
                  placeholderText="yyyy-mm-dd"
                  isClearable={true}
                  showIcon
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Customer Name *</Label>
                <InputCustom
                  size="md"
                  placeholder="Enter customer name"
                  value={formData.customerName || ''}
                  onChange={(e) => handleInputChange("customerName", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Status</Label>
                <SelectCustom
                  size="md"
                  items={invoiceStatusItems}
                  value={formData.status || 'DRAFT'}
                  onValueChange={(value) => handleInputChange("status", value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Pax</Label>
                <InputCustom
                  size="md"
                  placeholder="0"
                  value={formData.pax || ''}
                  onChange={(e) => handleInputChange("pax", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Agent Name</Label>
                <InputCustom
                  size="md"
                  placeholder="Enter agent name"
                  value={formData.agentName || ''}
                  onChange={(e) => handleInputChange("agentName", e.target.value)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Deposit KWR</Label>
                <InputCustom
                  size="md"
                  type="number"
                  placeholder="0"
                  value={formData.depositKWR || 0}
                  onChange={(e) => handleInputChange("depositKWR", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Deposit THB</Label>
                <InputCustom
                  size="md"
                  type="number"
                  placeholder="0"
                  value={formData.depositTHB || 0}
                  onChange={(e) => handleInputChange("depositTHB", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Total Amount KWR</Label>
                <InputCustom
                  size="md"
                  type="number"
                  disabled
                  placeholder="0"
                  value={formData.totalAmountKWR || 0}
                  onChange={(e) => handleInputChange("totalAmountKWR", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Total Amount THB</Label>
                <InputCustom
                  size="md"
                  type="number"
                  disabled
                  placeholder="0"
                  value={formData.totalAmountTHB || 0}
                  onChange={(e) => handleInputChange("totalAmountTHB", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Due Amount KWR</Label>
                <InputCustom
                  size="md"
                  type="number"
                  disabled
                  placeholder="0"
                  value={formData.dueAmountKWR || 0}
                  onChange={(e) => handleInputChange("dueAmountKWR", parseFloat(e.target.value) || 0)}
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label>Due Amount THB</Label>
                <InputCustom
                  size="md"
                  type="number"
                  disabled
                  placeholder="0"
                  value={formData.dueAmountTHB || 0}
                  onChange={(e) => handleInputChange("dueAmountTHB", parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="flex flex-row gap-4">
              <div className="flex-1 flex flex-col gap-2">
                <Label>Included Items</Label>
                <Textarea
                  value={formData.included || ''}
                  onChange={(e) => handleInputChange("included", e.target.value)}
                  placeholder="Enter included items..."
                  className="min-h-[100px]"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <Label>Not Included Items</Label>
                <Textarea
                  value={formData.notIncluded || ''}
                  onChange={(e) => handleInputChange("notIncluded", e.target.value)}
                  placeholder="Enter not included items..."
                  className="min-h-[100px]"
                />
              </div>
            </div>

            <div className="flex gap-4 justify-end">
              <ButtonCustom
                variant="default"
                size="default"
                onClick={() => router.push("/console/invoices")}
                disabled={isLoading}
              >
                Cancel
              </ButtonCustom>
              <ButtonCustom
                variant="green"
                size="default"
                onClick={handleSave}
                disabled={isLoading}
              >
                Create Invoice
              </ButtonCustom>
            </div>
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}
