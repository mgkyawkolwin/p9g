"use client"

import * as React from "react";
import {
  ColumnDef
} from "@tanstack/react-table";
import DataTable from "../../../lib/components/web/react/uicustom/datatable";
import { FormState } from "@/core/types";
import { useRouter } from "next/navigation";
import Reservation from "@/core/models/domain/Reservation";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { InputWithLabel } from "../../../lib/components/web/react/uicustom/inputwithlabel";
import { SelectWithLabel } from "../../../lib/components/web/react/uicustom/selectwithlabel";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import BillEditDialog from "../dialogs/billeditdialog";
import BillDialog from "../dialogs/billdialog";
import PaymentDialog from "../dialogs/paymentdialog";
import ReceiptDialog from "../dialogs/receiptdialog";
import { reservationCancel } from "@/app/(private)/[location]/console/reservations/actions";
import { toast } from "sonner";
import { getReservationStatusColorClass } from "@/core/helpers";
import { SelectList } from "@/core/constants";
import RoomChargeDialog from "../dialogs/roomschargedialog";
import { CopyIcon, Trash, FileText, FileImage, FileVideo, FileAudio, File, X, FileSpreadsheet } from "lucide-react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { useParams } from "next/navigation";

interface TdacUploadState {
  id: string;
  fileName: string;
  status: 'uploading' | 'done' | 'error';
  url?: string;
  mediaId?: string;
  error?: string;
}

interface DataTableProps {
  formState: FormState
  formAction: (formData: FormData) => void
  formRef: React.RefObject<HTMLFormElement | null>;
}

export default function ReservationListTable({
  formState,
  formAction,
  formRef
}: DataTableProps) {
  const params = useParams();
  const location = params.location as string;


  const router = useRouter();

  const fileInputRef = React.useRef(null);
  const receiptDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
  const paymentDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
  const editDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
  const viewDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);
  const roomDialogCallbackFunc = React.useRef<{ openDialog: (open: boolean) => void } | undefined>(undefined);


  const columns: ColumnDef<Reservation>[] = [
    {
      accessorKey: "customReservationInfo",
      header: "ID",
      accessorFn: (row) => {
        return <span>
          <div className="whitespace-nowrap"><a href={`/${location}/console/reservations/${row.id}/edit`}>{row.id.substring(0, 8)}</a>&nbsp;&nbsp;&nbsp;<CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(row.id)} /></div>
          <span className={`font-bold ${getReservationStatusColorClass(row.reservationStatusText)}`}>{row.reservationStatusText}</span><br />
          <span>{row.reservationTypeText}</span>
          {row.prepaidPackageText ? <span className="font-bold text-[#ff00ff] dark:text-[#ff00ff]"><br />{row.prepaidPackageText}</span> : ''}
          {row.promotionPackageText ? <span className="font-bold text-[#dd5500] dark:text-[#ff9911]"><br />{row.promotionPackageText}</span> : ''}
          <br />
          <span className={`font-bold cursor-pointer ${getInvoiceStatusColorClass(row.invoiceStatusText || row.invoiceStatus)}`} onClick={() => openInvoiceStatusDialog(row)}>Invoice <br />({row.invoiceStatusText || row.invoiceStatus || 'Not Required'})</span>
          {row.invoiceNumber ? <><br /><span className="text-sm">#{row.invoiceNumber}</span></> : null}
        </span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "customers",
      header: () => {
        return (
          "Customer Info"
        )
      },
      cell: ({ row }) => (
        <div>
          {row.original.customers?.map((customer, i) => (
            <React.Fragment key={i}>
              {i > 0 && <br />}
              {customer.englishName} {customer.name}<br /> ({customer.nationalId} / {customer.passport} / {customer.phone} / {customer.email})
              <br />
              <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
                <button type="button" className={`flex cursor-pointer items-center gap-1 text-left ${customer.tdacStatus === 'REQUIRED' ? 'text-[#ff0000]' : 'text-[#000000] dark:text-[#ffffff]'}`} onClick={() => openTdacDialog(row.original.id, customer)}>
                  <span className="font-bold">TDAC :</span>&nbsp;{customer.tdacStatusText || 'Unknown'}
                </button>
                <button type="button" className="flex cursor-pointer items-center gap-1 text-sm text-[#555] hover:text-[#000]" onClick={() => openTdacDialog(row.original.id, customer)}>
                  <FileText className="w-4 h-4" />
                  Files {customer.medias?.length ? `(${customer.medias.length})` : ''}
                </button>
              </div>
            </React.Fragment>
          ))}
        </div>
      ),
    },
    {
      accessorKey: "arrivalDeparture",
      header: "Arrival / Departure",
      accessorFn: (row) => {
        return <span>
          {row.arrivalDateTime ? new Date(row.arrivalDateTime).toISODateTimeDisplayString() : ''} {row.arrivalFlight} {row.pickUpTypeText}<br />
          {row.departureDateTime ? new Date(row.departureDateTime).toISODateTimeDisplayString() : ''} {row.departureFlight} {row.dropOffTypeText}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "checkInCheckOut",
      header: "Check-In / Check-Out",
      accessorFn: (row) => {
        return <span>
          {new Date(row.checkInDate!).toISOFormatDateString()}<br />
          {new Date(row.checkOutDate!).toISOFormatDateString()}<br />
          {row.noOfDays} days, {row.noOfGuests ? row.noOfGuests + ' pax(s)' : ''}, {row.roomNo}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "depositInfo",
      header: "Deposit",
      accessorFn: (row) => {
        return <span>{row.depositAmount > 0 ? row.depositAmount : ''}<br />{row.depositAmountInCurrency > 0 ? row.depositAmountInCurrency + ' ' + row.depositCurrency : ''} <br /> {row.depositAmount > 0 ? row.depositPaymentMode : ''} <br /> {row.depositDateUTC ? new Date(row.depositDateUTC).toLocaleDateString('sv-SE') : ""}</span>;
      },
      cell: (row) => row.getValue(),
    },
    {
      accessorKey: "bookingSource",
      header: 'Source',
      cell: (row) => {
        return <div className="flex max-w-[150px] whitespace-normal" >{String(row.getValue())}</div>
      }
    },
    {
      accessorKey: "remark",
      header: 'Remark',
      cell: (row) => {
        return <div className="flex max-w-[150px] whitespace-normal" >{String(row.getValue())}</div>
      }
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => {
        return <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              roomDialogCallbackFunc.current?.openDialog(true);
              setReservationId(row.original.id);

            }}>Rooms & Charges</ButtonCustom>
          </div>
          <div className="flex gap-1">
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              receiptDialogCallbackFunc.current?.openDialog(true);
              setReservationId(row.original.id);

            }}>Receipt</ButtonCustom>
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              paymentDialogCallbackFunc.current?.openDialog(true);
              setReservationId(row.original.id);

            }}>Payment</ButtonCustom>
          </div>
          <div className="flex gap-1">
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              viewDialogCallbackFunc.current?.openDialog(true);
              setReservationId(row.original.id);

            }}>View Bill</ButtonCustom>
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              editDialogCallbackFunc.current?.openDialog(true);
              setReservationId(row.original.id);

            }}>Edit Bill</ButtonCustom>
          </div>
          <div className="flex gap-1">
            <ButtonCustom type="button" variant={"black"} size={"sm"} onClick={() => {
              router.push(`/${location}/console/reservations/${row.original.id}/edit`);
            }} >Edit</ButtonCustom>
            <ButtonCustom type="button" variant={"red"} size={"sm"} onClick={() => {
              setCancelId(row.original.id);
              setOpenDialog(true);
            }}>Cancel</ButtonCustom>
          </div>
        </div>
      }
    },
  ];

  const [openDiallog, setOpenDialog] = React.useState(false);
  const [openInvoiceDialog, setOpenInvoiceDialog] = React.useState(false);
  const [invoiceDialogReservation, setInvoiceDialogReservation] = React.useState<{ reservationId: string; invoiceStatus: string; invoiceNumber: string; } | null>(null);
  const [invoiceUpdating, setInvoiceUpdating] = React.useState(false);
  const [cancelId, setCancelId] = React.useState<string>('');
  const [reservationId, setReservationId] = React.useState('');
  const [customerId, setCustomerId] = React.useState('');
  const [tdacDialogOpen, setTdacDialogOpen] = React.useState(false);
  const [selectedReservationCustomerId, setSelectedReservationCustomerId] = React.useState('');
  const [selectedTdacStatusValue, setSelectedTdacStatusValue] = React.useState('');
  const [selectedCustomerName, setSelectedCustomerName] = React.useState('');
  const [tdacUploadFiles, setTdacUploadFiles] = React.useState<TdacUploadState[]>([]);
  const [tdacMediaList, setTdacMediaList] = React.useState<Array<{ id: string; url: string; fileName: string }>>([]);
  const [loading, setLoading] = React.useState(false);

  const invoiceStatusOptions = SelectList.INVOICE_STATUS;
  const tdacStatusOptions = new Map<string, string>([
    ['NOT_REQUIRED', 'Not Required'],
    ['REQUIRED', 'Required'],
    ['SENT', 'Sent']
  ]);

  const getInvoiceStatusColorClass = (status?: string | null) => {
    if (!status) return '';
    const normalized = status.toLowerCase();
    if (normalized.includes('sent')) return 'text-[#00a000]';
    if (normalized.includes('not_required')) return 'text-[#ff0000]';
    return '';
  };

  const getTdacFileExtension = (fileName: string) => {
    const cleanedName = fileName.split('/').pop()?.split('?')[0].split('#')[0] || fileName;
    const ext = cleanedName.includes('.') ? cleanedName.substring(cleanedName.lastIndexOf('.') + 1).toLowerCase() : '';
    return ext ? ext.toUpperCase() : '';
  };

  // Update your getTdacFileIcon function to accept size parameter
  const getTdacFileIcon = (fileName) => {
    const extension = getTdacFileExtension(fileName)?.toLowerCase();

    switch (extension) {
      case 'pdf':
        return <FileText width={100} height={100} className={`text-red-500`} />;
      case 'doc':
      case 'docx':
        return <FileText width={100} height={100} className={`text-blue-500`} />;
      case 'xls':
      case 'xlsx':
        return <FileSpreadsheet width={100} height={100} className={`text-green-500`} />;
      case 'jpg':
      case 'jpeg':
      case 'png':
      case 'gif':
        return <File width={100} height={100} className={`text-gray-500`} />;
      default:
        return <File width={100} height={100} className={`text-gray-500`} />;
    }
  };

  const isImageFile = (fileName: string) => {
    const cleanedName = fileName.split('/').pop()?.split('?')[0].split('#')[0] || fileName;
    const ext = cleanedName.includes('.') ? cleanedName.substring(cleanedName.lastIndexOf('.') + 1).toLowerCase() : '';
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
  };

  const openInvoiceStatusDialog = (reservation: Reservation) => {
    setInvoiceDialogReservation({
      reservationId: reservation.id,
      invoiceStatus: reservation.invoiceStatus,
      invoiceNumber: reservation.invoiceNumber || ''
    });
    setOpenInvoiceDialog(true);
  };

  const openTdacDialog = (reservationId: string, customer: any) => {
    setReservationId(reservationId);
    setCustomerId(customer.id || '');
    setSelectedReservationCustomerId(customer.reservationCustomerId || '');
    setSelectedTdacStatusValue(customer.tdacStatusValue || '');
    setSelectedCustomerName(`${customer.englishName || ''} ${customer.name || ''}`.trim());
    setTdacMediaList(customer.medias?.map((m: any) => ({ id: m.id, url: m.url, fileName: m.url ? m.url.split('/').pop() : m.fileName || 'File' })) || []);
    setTdacUploadFiles([]);
    setTdacDialogOpen(true);
  };

  const closeTdacDialog = () => {
    setTdacDialogOpen(false);
    setSelectedReservationCustomerId('');
    setSelectedTdacStatusValue('');
    setSelectedCustomerName('');
    setTdacUploadFiles([]);
    setTdacMediaList([]);
  };

  const saveTdacStatus = async () => {
    if (!selectedReservationCustomerId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reservationcustomers/${selectedReservationCustomerId}/tdacstatus`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Resort-Location': location
        },
        body: JSON.stringify({ tdacStatusValue: selectedTdacStatusValue })
      });
      const responseData = await response.json();
      if (responseData.message) toast(responseData.message);
      if (!response.ok) throw new Error(responseData.message || 'TDAC status update failed');
      closeTdacDialog();
      formRef?.current?.requestSubmit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error saving TDAC status.';
      toast(message);
    } finally {
      setLoading(false);
    }
  };

  const handleTdacFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    if (!files.length || !selectedReservationCustomerId) return;

    const uploadStates = files.map(file => ({
      id: crypto.randomUUID?.() || `${file.name}-${Date.now()}`,
      fileName: file.name,
      status: 'uploading' as const,
    }));
    setTdacUploadFiles(prev => [...prev, ...uploadStates]);
    setLoading(true);

    const formData = new FormData();
    files.forEach((file) => formData.append('file', file));
    formData.append('reservationCustomerId', selectedReservationCustomerId);
    formData.append('reservationId', reservationId);
    formData.append('customerId', customerId);

    try {
      const response = await fetch(`/api/reservationcustomer/${selectedReservationCustomerId}/tdacfiles`, {
        method: 'POST',
        headers: {
          'X-Resort-Location': location
        },
        body: formData
      });
      const responseData = await response.json();
      if (responseData.message) toast(responseData.message);
      if (!response.ok) throw new Error(responseData.message || 'TDAC file upload failed');

      const uploadedFiles = Array.isArray(responseData.files) ? responseData.files : [];
      const newMediaList = uploadedFiles.map((file: any) => ({ id: file.mediaId || file.id, url: file.url, fileName: file.fileName }));
      setTdacMediaList(prev => [...prev, ...newMediaList]);
      setTdacUploadFiles([]);
      formRef?.current?.requestSubmit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error uploading TDAC files.';
      toast(message);
      setTdacUploadFiles(prev => prev.map(file => ({ ...file, status: 'error', error: message })));
    } finally {
      setLoading(false);
      if (event.target) event.target.value = '';
    }
  };

  const deleteTdacMedia = async (mediaId: string) => {
    if (!mediaId || !selectedReservationCustomerId) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/reservationcustomer/${selectedReservationCustomerId}/tdacfiles/${mediaId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'X-Resort-Location': location
        }
      });
      const responseData = await response.json();
      if (responseData.message) toast(responseData.message);
      if (!response.ok) throw new Error(responseData.message || 'Delete failed');
      setTdacMediaList(prev => prev.filter(file => file.id !== mediaId));
      formRef?.current?.requestSubmit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error deleting file.';
      toast(message);
    } finally {
      setLoading(false);
    }
  };

  const saveInvoiceStatus = async () => {
    if (!invoiceDialogReservation) return;
    setInvoiceUpdating(true);
    try {
      const payload: any = {
        invoiceStatus: invoiceDialogReservation.invoiceStatus
      };
      if (invoiceDialogReservation.invoiceNumber) {
        payload.invoiceNumber = invoiceDialogReservation.invoiceNumber;
      }

      const response = await fetch(`/api/reservations/${invoiceDialogReservation.reservationId}/invoice-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-Resort-Location': location
        },
        body: JSON.stringify(payload)
      });
      const responseData = await response.json();
      if (responseData.message) toast(responseData.message);
      if (!response.ok) throw new Error(responseData.message || 'Invoice update failed');
      setOpenInvoiceDialog(false);
      setInvoiceDialogReservation(null);
      formRef?.current?.requestSubmit();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error updating invoice status.';
      toast(message);
    } finally {
      setInvoiceUpdating(false);
    }
  };

  return (
    <>
      <Loader isLoading={loading} />
      <DataTable columns={columns} formState={formState} formAction={formAction} formRef={formRef} />
      <section className="flex">
        <Dialog open={openDiallog} onOpenChange={setOpenDialog}>
          <DialogContent className="">
            <DialogHeader>
              <DialogTitle>Confirm!</DialogTitle>
              <DialogDescription>Are you sure you want to cancel the reservation?</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <ButtonCustom variant={"red"} type="button" onClick={async () => {
                setOpenDialog(false);
                const response = await reservationCancel(cancelId, location);
                if (response.message) toast(response.message);
                if (!response.error) window.location.reload();
              }}>Yes</ButtonCustom>
              <DialogClose asChild>
                <ButtonCustom variant="black" onClick={() => {
                  setCancelId('');
                  setOpenDialog(false);
                }}>No</ButtonCustom>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </section>
      <ReceiptDialog reservationId={reservationId} callbackFunctions={(func) => { receiptDialogCallbackFunc.current = func }} />
      <PaymentDialog reservationId={reservationId} callbackFunctions={(func) => { paymentDialogCallbackFunc.current = func }} />
      <BillEditDialog reservationId={reservationId} callbackFunctions={(func) => { editDialogCallbackFunc.current = func }} />
      <BillDialog reservationId={reservationId} callbackFunctions={(func) => { viewDialogCallbackFunc.current = func }} />
      <RoomChargeDialog reservationId={reservationId} callbackFunctions={(func) => { roomDialogCallbackFunc.current = func }} />
      <Dialog open={tdacDialogOpen} onOpenChange={(value) => {
        if (!value) closeTdacDialog();
        setTdacDialogOpen(value);
      }}>
        <DialogContent className="flex flex-col min-h-[90vh] max-h-[90vh] min-w-[70vw] max-w-[90vw] overflow-auto">
          <DialogHeader>
            <DialogTitle>TDAC</DialogTitle>
            <DialogDescription>Update TDAC status and manage uploaded files.</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4 flex-1 min-h-0">
            <div className="text-sm font-semibold">{selectedCustomerName || 'Customer'}</div>

            <SelectWithLabel
              name="tdacStatus"
              label="TDAC Status"
              labelPosition="top"
              variant="form"
              size="sm"
              items={tdacStatusOptions}
              value={selectedTdacStatusValue}
              onValueChange={(value) => setSelectedTdacStatusValue(value)}
            />

            <div className="flex flex-wrap items-center gap-2">
              <ButtonCustom type="button" variant="black" size="sm" onClick={() => fileInputRef?.current?.click()}>
                Upload Files
              </ButtonCustom>
              <span className="text-sm text-slate-500">{tdacMediaList.length} saved file(s)</span>
            </div>

            {/* Fixed size scrollable container */}
            <div className="overflow-auto" style={{ height: '50vh', maxWidth: '70vw' }}>
              <div className="flex flex-row flex-wrap gap-4 p-1">
                {tdacMediaList.map((file) => {
                  const fileIdentifier = file.fileName || file.url || '';
                  const extensionLabel = getTdacFileExtension(fileIdentifier) || 'FILE';
                  const imageFile = isImageFile(fileIdentifier);

                  return (
                    <div
                      key={file.id}
                      className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 shadow-sm transition-all hover:shadow-md dark:border-slate-700"
                    >
                      {/* Delete button */}
                      <button
                        type="button"
                        className="absolute right-2 top-2 z-10 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-red-500 shadow-md transition-all hover:scale-110 hover:bg-red-600"
                        onClick={() => deleteTdacMedia(file.id)}
                      >
                        <X className="h-3.5 w-3.5 text-black" />
                      </button>

                      <a
                        href={`/api/public/files?fileUrl=${encodeURIComponent(file.url)}`}
                        target="_blank"
                        rel="noreferrer noopener"
                        className="flex flex-col items-center justify-start p-3 text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-950"
                      >
                        {/* Fixed size container for images and icons */}
                        <div className="p-1 items-center justify-center">
                          {imageFile ? (
                            <img height={100} width={100}
                              src={`/api/public/files?fileUrl=${encodeURIComponent(file.url)}`}
                              alt={file.fileName}
                              className="h-[50px] max-h-[50px] rounded object-contain"
                            />
                          ) : (
                            <div className="flex-col items-center justify-center rounded bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900">
                              {/* Fixed size icon - 80x80 */}
                              <div className="p-1 items-center justify-center">
                                {getTdacFileIcon(fileIdentifier)}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* File info with extension always visible */}
                        <div className="mt-3 w-full space-y-1">

                          {/* File extension badge */}
                          <div className="flex justify-center">
                            <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-0.5 text-xs font-bold uppercase text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                              {extensionLabel}
                            </span>
                          </div>
                        </div>
                      </a>
                    </div>
                  );
                })}

                {/* Uploading files */}
                {tdacUploadFiles.map((file) => {
                  const extensionLabel = getTdacFileExtension(file.fileName) || 'FILE';
                  return (
                    <div
                      key={file.id}
                      className="relative flex w-[160px] flex-col overflow-hidden rounded-lg border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950"
                    >
                      <div className="flex h-[140px] w-[140px] items-center justify-center">
                        <div className="flex h-20 w-20 items-center justify-center">
                          {getTdacFileIcon(file.fileName)}
                        </div>
                      </div>

                      <div className="mt-3 w-full space-y-1">
                        <div className="truncate text-center text-xs font-medium" title={file.fileName}>
                          {file.fileName}
                        </div>
                        <div className="flex justify-center">
                          <span className="inline-flex items-center rounded-md bg-yellow-50 px-2 py-0.5 text-xs font-bold uppercase text-yellow-700 dark:bg-yellow-950/50 dark:text-yellow-300">
                            {extensionLabel}
                          </span>
                        </div>
                        <div className="mt-2 text-center text-xs text-slate-500">
                          Uploading...
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Empty state */}
                {tdacMediaList.length === 0 && tdacUploadFiles.length === 0 && (
                  <div className="flex p-8 h-[200px] w-full items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-400">
                    No TDAC files yet. Click "Upload Files" to add some.
                  </div>
                )}
              </div>
            </div>
          </div>

          <DialogFooter>
            <ButtonCustom variant="green" type="button" onClick={saveTdacStatus} disabled={loading}>
              Save
            </ButtonCustom>
            <DialogClose asChild>
              <ButtonCustom type="button" onClick={closeTdacDialog}>
                Close
              </ButtonCustom>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={openInvoiceDialog} onOpenChange={(value) => {
        if (!value) setInvoiceDialogReservation(null);
        setOpenInvoiceDialog(value);
      }}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle>Invoice Status</DialogTitle>
            <DialogDescription>Update the invoice status and optional invoice number for this reservation.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <SelectWithLabel
              name="invoiceStatus"
              label="Invoice Status"
              labelPosition="top"
              variant="form"
              size="sm"
              items={invoiceStatusOptions}
              value={invoiceDialogReservation?.invoiceStatus ?? ''}
              onValueChange={(value) => setInvoiceDialogReservation(prev => prev ? { ...prev, invoiceStatus: value } : prev)}
            />
            <InputWithLabel
              name="invoiceNumber"
              label="Invoice Number"
              labelPosition="top"
              variant="form"
              size="sm"
              value={invoiceDialogReservation?.invoiceNumber ?? ''}
              onChange={(event) => setInvoiceDialogReservation(prev => prev ? { ...prev, invoiceNumber: event.target.value } : prev)}
            />
          </div>
          <DialogFooter>
            <ButtonCustom variant={"green"} type="button" onClick={saveInvoiceStatus} disabled={invoiceUpdating}>
              Save
            </ButtonCustom>
            <DialogClose asChild>
              <ButtonCustom variant={"black"} type="button" onClick={() => setInvoiceDialogReservation(null)}>
                Close
              </ButtonCustom>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleTdacFileSelect}
        accept={"application/pdf"}
        multiple
        className="hidden"
      />
    </>
  )
}