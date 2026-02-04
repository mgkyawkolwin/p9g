
import * as React from "react";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { SelectWithLabel } from "../../../lib/components/web/react/uicustom/selectwithlabel";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputCustom } from "../../../lib/components/web/react/uicustom/inputcustom";
import { Label } from "../../../lib/components/web/react/ui/label";


const initialData = {
    invoiceNumber: "",
    invoiceStatus: "DEFAULT",
    location: "",
    agentName: "",
    customerName: "",
    invoiceDateFrom: null,
    invoiceDateUntil: null,
    dueDateFrom: null,
    dueDateUntil: null,
    startDateFrom: null,
    startDateUntil: null,
    createdDateFrom: null,
    createdDateUntil: null,
};

interface DataTableProps {
    formRef?: React.RefObject<HTMLFormElement | null>;
}


export default function InvoiceListSearch({
    formRef
}: DataTableProps) {

    const [formData, setFormData] = React.useState(initialData);

    const invoiceStatusItems = new Map<string, string>([
        ["DEFAULT", "All"],
        ["DRAFT", "Draft"],
        ["SENT", "Sent"],
        ["PAID", "Paid"],
        ["OVERDUE", "Overdue"],
        ["CANCELLED", "Cancelled"]
    ]);

    return (
        <section aria-label="Invoice List Search" className="flex w-full flex-col gap-4">
            <div className="flex gap-4 flex-wrap">
                <SelectWithLabel label="Invoice Status" labelPosition="top" items={invoiceStatusItems} defaultValue={formData.invoiceStatus} onValueChange={(value) => setFormData({ ...formData, invoiceStatus: value })} />
                <InputWithLabel labelPosition="top" size="md" name="searchInvoiceNumber" label="Invoice Number" defaultValue={formData.invoiceNumber} onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })} />
                <InputWithLabel labelPosition="top" size="md" name="searchAgentName" label="Agent Name" defaultValue={formData.agentName} onChange={(e) => setFormData({ ...formData, agentName: e.target.value })} />
                <InputWithLabel labelPosition="top" size="md" name="searchCustomerName" label="Customer Name" defaultValue={formData.customerName} onChange={(e) => setFormData({ ...formData, customerName: e.target.value })} />
                <input type="hidden" name="searchInvoiceStatus" value={formData.invoiceStatus} />
            </div>
            <div className="flex gap-4 items-end">
                <div className="flex flex-col gap-1">
                    <Label>Created Date From</Label>
                    <DatePicker
                        selected={formData.createdDateFrom}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, createdDateFrom: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchCreatedDateFrom" defaultValue={formData.createdDateFrom ? formData.createdDateFrom.toLocaleDateString('sv-SE') : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Until</Label>
                    <DatePicker
                        selected={formData.createdDateUntil}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, createdDateUntil: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchCreatedDateUntil" defaultValue={formData.createdDateUntil ? formData.createdDateUntil.toLocaleDateString('sv-SE') : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Invoice Date From</Label>
                    <DatePicker
                        selected={formData.invoiceDateFrom}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, invoiceDateFrom: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchInvoiceDateFrom" defaultValue={formData.invoiceDateFrom ? formData.invoiceDateFrom.toLocaleDateString('sv-SE') : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Until</Label>
                    <DatePicker
                        selected={formData.invoiceDateUntil}
                        onChange={(date: Date | null) => {
                            setFormData(prev => ({ ...prev, invoiceDateUntil: date }))
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchInvoiceDateUntil" defaultValue={formData.invoiceDateUntil ? formData.invoiceDateUntil.toLocaleDateString('sv-SE') : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Due Date From</Label>
                    <DatePicker
                        selected={formData.dueDateFrom}
                        onChange={(date: Date | null) => setFormData(prev => ({ ...prev, dueDateFrom: date }))}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchDueDateFrom" defaultValue={formData.dueDateFrom ? formData.dueDateFrom.toLocaleDateString('sv-SE') : ''} />
                </div>
                <div className="flex flex-col gap-1">
                    <Label>Until</Label>
                    <DatePicker
                        selected={formData.dueDateUntil}
                        onChange={(date: Date | null) => setFormData(prev => ({ ...prev, dueDateUntil: date }))}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                    />
                    <input type="hidden" name="searchDueDateUntil" defaultValue={formData.dueDateUntil ? formData.dueDateUntil.toLocaleDateString('sv-SE') : ''} />
                </div>
                <ButtonCustom type="submit" variant={"green"} size={"default"}>
                    Search
                </ButtonCustom>
                <ButtonCustom type="reset" variant={"default"} size={"default"} onClick={() => {
                    setFormData(initialData);
                    formRef?.current?.reset();
                }}>
                    Reset
                </ButtonCustom>
            </div>
        </section>
    );
}
