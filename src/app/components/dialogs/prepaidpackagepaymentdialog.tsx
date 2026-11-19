'use client';

import * as React from "react";
import DatePicker from "react-datepicker";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import PrepaidPackagePayment from "@/core/models/domain/PrepaidPackagePayment";
import { SelectList } from "@/core/constants";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { SelectCustom } from "@/lib/components/web/react/uicustom/selectcustom";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/lib/components/web/react/ui/dialog";
import { Textarea } from "@/lib/components/web/react/ui/textarea";
import { CheckboxCustom } from "@/lib/components/web/react/uicustom/CheckboxCustom";
import { prepaidPackagePaymentCreate, prepaidPackagePaymentDelete, prepaidPackagePaymentGetList, prepaidPackagePaymentUpdate } from "@/app/(private)/[location]/console/packages/new/actions";

import "react-datepicker/dist/react-datepicker.css";

const htmlEscapes: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escapeHtml = (value: string) => value.replace(/[&<>"']/g, ch => htmlEscapes[ch]);

interface PrepaidPackagePaymentDialogProps {
  openCallback?: (callbacks: {
    openDialog: (open: boolean, prepaidPackageId?: string, customerName?: string) => void;
  }) => void;
  onSaved?: () => void;
}

interface PrepaidPackagePaymentRow extends PrepaidPackagePayment {
  rowKey: string;
  isNew: boolean;
  isModified: boolean;
}


export default function PrepaidPackagePaymentDialog({ openCallback, onSaved }: PrepaidPackagePaymentDialogProps) {
  const params = useParams();
  const location = params.location as string;
  const [open, setOpen] = React.useState(false);
  const [prepaidPackageId, setPrepaidPackageId] = React.useState('');
  const [payments, setPayments] = React.useState<PrepaidPackagePaymentRow[]>([]);
  const [isSaving, setIsSaving] = React.useState(false);
  const [customerName, setCustomerName] = React.useState('');
  const [checkedRowKeys, setCheckedRowKeys] = React.useState<Set<string>>(new Set());
  const draftCounter = React.useRef(0);

  const openDialog = React.useCallback((isOpen: boolean, id?: string, name?: string) => {
    if (id) setPrepaidPackageId(id);
    if (name !== undefined) setCustomerName(name);
    setOpen(isOpen);
    if (isOpen) {
      setPayments([]);
      setCheckedRowKeys(new Set());
    }
  }, []);

  React.useEffect(() => {
    openCallback?.({ openDialog });
  }, [openCallback, openDialog]);

  React.useEffect(() => {
    if (!open || !prepaidPackageId) return;

    async function loadPayments() {
      const result = await prepaidPackagePaymentGetList(prepaidPackageId, location);
      if (result.error) {
        toast(result.message);
        return;
      }

      setPayments(((result.data ?? []) as PrepaidPackagePayment[]).map(payment => ({
        ...payment,
        paymentDateTimeUTC: new Date(payment.paymentDateTimeUTC),
        rowKey: payment.id,
        isNew: false,
        isModified: false
      })));
    }

    loadPayments();
  }, [open, prepaidPackageId, location]);

  const handleInputChange = (rowKey: string, field: keyof PrepaidPackagePaymentRow, value: string | number | Date) => {
    setPayments(previous => previous.map(payment =>
      payment.rowKey === rowKey ? {
        ...payment,
        [field]: value,
        isModified: payment.isNew ? false : true
      } : payment
    ));
  };

  const addPaymentRow = () => {
    draftCounter.current += 1;
    const rowKey = `draft-${Date.now()}-${draftCounter.current}`;
    setPayments(previous => [...previous, {
      ...new PrepaidPackagePayment(),
      id: rowKey,
      prepaidPackageId,
      rowKey,
      isNew: true,
      isModified: false
    }]);
  };

  const savePayments = async () => {
    const pendingPayments = payments.filter(payment => payment.isNew || payment.isModified);
    if (pendingPayments.some(payment => payment.amount <= 0)) {
      toast('Payment amount must be greater than zero.');
      return;
    }

    setIsSaving(true);
    try {
      for (const payment of pendingPayments) {
        const paymentData = {
          amount: Number(payment.amount),
          paymentDateTimeUTC: payment.paymentDateTimeUTC,
          currency: payment.currency,
          paymentMode: payment.paymentMode,
          remark: payment.remark,
          description: payment.description
        };
        const result = payment.isNew
          ? await prepaidPackagePaymentCreate(prepaidPackageId, paymentData, location)
          : await prepaidPackagePaymentUpdate(prepaidPackageId, payment.id, paymentData, location);
        if (result.message) toast(result.message);
        if (result.error) return;

        const savedPayment = result.data as PrepaidPackagePayment;
        setPayments(previous => previous.map(row => row.rowKey === payment.rowKey ? {
          ...savedPayment,
          paymentDateTimeUTC: new Date(savedPayment.paymentDateTimeUTC),
          rowKey: payment.rowKey,
          isNew: false,
          isModified: false
        } : row));
      }

      if (pendingPayments.length > 0) onSaved?.();
    } finally {
      setIsSaving(false);
    }
  };

  const deletePayment = async (payment: PrepaidPackagePaymentRow) => {
    if (payment.isNew) {
      setPayments(previous => previous.filter(row => row.rowKey !== payment.rowKey));
      return;
    }

    setIsSaving(true);
    try {
      const result = await prepaidPackagePaymentDelete(prepaidPackageId, payment.id, location);
      if (result.message) toast(result.message);
      if (result.error) return;

      setPayments(previous => previous.filter(row => row.rowKey !== payment.rowKey));
      onSaved?.();
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintReceipt = () => {
    const checkedPayments = payments.filter(payment => checkedRowKeys.has(payment.rowKey));
    if (checkedPayments.length === 0) {
      toast('Select at least one payment row to print.');
      return;
    }

    const total = checkedPayments.reduce((sum, payment) => sum + (Number(payment.amount) || 0), 0);
    const headerCell = (align: string, label: string) => `<th style="border: 1px solid #666; padding: 8px; text-align: ${align}; background-color: #eee;">${label}</th>`;
    const bodyCell = (align: string, value: string) => `<td style="border: 1px solid #666; padding: 8px; text-align: ${align};">${value}</td>`;

    let content = `<table style="width:100%;border-collapse: collapse;font-size:10pt;">`;
    content += `<thead><tr>` +
      headerCell('right', '#') +
      headerCell('left', 'Payment Date') +
      headerCell('left', 'Description') +
      headerCell('left', 'Payment Mode') +
      headerCell('right', 'Cur') +
      headerCell('right', 'Amount') +
      `</tr></thead><tbody>`;

    checkedPayments.forEach((payment, index) => {
      content += `<tr>` +
        bodyCell('right', String(index + 1)) +
        bodyCell('left', payment.paymentDateTimeUTC ? new Date(payment.paymentDateTimeUTC).toLocaleDateString('sv-SE') : '') +
        bodyCell('left', escapeHtml(payment.description ?? '')) +
        bodyCell('left', escapeHtml(payment.paymentMode ?? '')) +
        bodyCell('right', escapeHtml(payment.currency ?? '')) +
        bodyCell('right', String(payment.amount ?? '')) +
        `</tr>`;
    });
    content += `</tbody>`;
    content += `<tfoot><tr>` +
      `<td colspan="5" style="padding: 8px; text-align: right; font-weight:bold;">Total</td>` +
      `<td style="border: 1px solid #666; padding: 8px; text-align: right; font-weight:bold;">${total.toFixed(2)}</td>` +
      `</tr></tfoot>`;
    content += `</table>`;

    const win = window.open('', 'Print', `width=${screen.availWidth},height=${screen.availHeight},left=0,top=0`);
    if (win) {
      win.document.open();
      win.document.writeln(
        `<html><style>@media print{ @page {margin:0;}}</style>` +
        `<body style="padding:0.5in;font-size:10pt;"><div><img src="/p9glogowithtext.png" style="width:200px;" /></div>` +
        `<div style="display:block;width:100%;text-align:center;font-size:18pt;">Receipt</div><br/><br/>` +
        `<table style="width:100%;font-size:10pt;"><tr><td>Customer: ${escapeHtml(customerName)}</td><td style="text-align:right;">Date: ____/____/________</td></tr></table>` +
        `<div><br/>${content}</div><br/><br/><br/><div style="width:100%;text-align:right;">Cashier Signature : ____________________</div><br/>` +
        `<div style="display:block;width:100%;align:middle;"><img src="/p9gqr.png" style="width:350px;" /></div></body></html>`
      );
      win.document.close();
      win.focus();
      win.onload = function () {
        win.print();
        win.close();
      }
    }
  };


  return (
    <Dialog open={open} onOpenChange={setOpen}>
  <DialogContent
  style={{ width: '80vw', height: '80vh', maxWidth: 'none', padding: '50px' }}
  className="flex flex-col overflow-hidden p-[100px]"
>
    <DialogHeader>
      <DialogTitle>Package Payments</DialogTitle>
      <DialogDescription />
    </DialogHeader>

    <div className="flex min-h-0 flex-1 flex-col gap-5 p-[50px]">
      {/* Scrollable table area */}
      <div className="min-h-0 flex-1 overflow-auto rounded-md border">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="border-b text-left">
              <th className="px-3 py-2">Print</th>
              <th className="px-3 py-2">Date / Time</th>
              <th className="px-3 py-2">Description</th>
              <th className="px-3 py-2 text-right">Amount</th>
              <th className="px-3 py-2">Currency</th>
              <th className="px-3 py-2">Payment Mode</th>
              <th className="px-3 py-2">Remark</th>
              <th className="px-3 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map(payment => (
              <tr key={payment.rowKey} className="border-b">
                <td className="px-3 py-2">
                  <CheckboxCustom
                    checked={checkedRowKeys.has(payment.rowKey)}
                    onCheckedChange={checked => setCheckedRowKeys(previous => {
                      const next = new Set(previous);
                      if (checked) next.add(payment.rowKey);
                      else next.delete(payment.rowKey);
                      return next;
                    })}
                  />
                </td>
                <td className="px-3 py-2">
                  <DatePicker
                    selected={payment.paymentDateTimeUTC}
                    onChange={(date: Date | null) => date && handleInputChange(payment.rowKey, 'paymentDateTimeUTC', date)}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom size="md" />}
                    showTimeSelect
                    timeIntervals={5}
                    timeFormat="HH:mm"
                  />
                </td>
                <td className="px-3 py-2">
                  <InputCustom
                    type="text"
                    maxLength={200}
                    value={payment.description ?? ''}
                    onChange={event => handleInputChange(payment.rowKey, 'description', event.target.value)}
                  />
                </td>
                <td className="px-3 py-2 text-right">
                  <InputCustom
                    type="text"
                    inputMode="decimal"
                    value={payment.amount}
                    onChange={event => handleInputChange(payment.rowKey, 'amount', Number(event.target.value || 0))}
                  />
                </td>
                <td className="px-3 py-2">
                  <SelectCustom name={`currency-${payment.rowKey}`} items={SelectList.CURRENCY} value={payment.currency} onValueChange={value => handleInputChange(payment.rowKey, 'currency', value)} />
                </td>
                <td className="px-3 py-2">
                  <SelectCustom name={`payment-mode-${payment.rowKey}`} items={SelectList.PACKAGE_PAYMENT_MODE} value={payment.paymentMode} onValueChange={value => handleInputChange(payment.rowKey, 'paymentMode', value)} />
                </td>
                <td className="px-3 py-2">
                  <Textarea rows={2} maxLength={500} value={payment.remark} onChange={event => handleInputChange(payment.rowKey, 'remark', event.target.value)} />
                </td>
                <td className="px-3 py-2">
                  <ButtonCustom
                    type="button"
                    variant={payment.isNew ? "black" : "red"}
                    size="sm"
                    disabled={isSaving}
                    onClick={() => deletePayment(payment)}
                  >
                    {payment.isNew ? 'Remove' : 'Delete'}
                  </ButtonCustom>
                </td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td className="px-3 py-4 text-center" colSpan={8}>No payments recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2">
        <ButtonCustom type="button" variant="green" disabled={isSaving || !payments.some(payment => payment.isNew || payment.isModified)} onClick={savePayments}>Save Payment</ButtonCustom>
        <ButtonCustom type="button" onClick={addPaymentRow}>Add Row</ButtonCustom>
        <ButtonCustom type="button" variant="black" onClick={handlePrintReceipt}>Print Receipt</ButtonCustom>
        <ButtonCustom type="button" variant="black" onClick={() => setOpen(false)}>Close</ButtonCustom>
      </div>
    </div>
  </DialogContent>
</Dialog>
  );
}