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
import { prepaidPackagePaymentCreate, prepaidPackagePaymentDelete, prepaidPackagePaymentGetList, prepaidPackagePaymentUpdate } from "@/app/(private)/[location]/console/packages/new/actions";

import "react-datepicker/dist/react-datepicker.css";


interface PrepaidPackagePaymentDialogProps {
  openCallback?: (callbacks: {
    openDialog: (open: boolean, prepaidPackageId?: string) => void;
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
  const draftCounter = React.useRef(0);

  const openDialog = React.useCallback((isOpen: boolean, id?: string) => {
    if (id) setPrepaidPackageId(id);
    setOpen(isOpen);
    if (isOpen) setPayments([]);
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
          remark: payment.remark
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
              <th className="px-3 py-2">Date / Time</th>
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
              <tr><td className="px-3 py-4 text-center" colSpan={6}>No payments recorded.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex justify-end gap-2">
        <ButtonCustom type="button" variant="green" disabled={isSaving || !payments.some(payment => payment.isNew || payment.isModified)} onClick={savePayments}>Save Payment</ButtonCustom>
        <ButtonCustom type="button" onClick={addPaymentRow}>Add Row</ButtonCustom>
        <ButtonCustom type="button" variant="black" onClick={() => setOpen(false)}>Close</ButtonCustom>
      </div>
    </div>
  </DialogContent>
</Dialog>
  );
}