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
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../../../lib/components/web/react/ui/dialog";
import BillEditDialog from "../dialogs/billeditdialog";
import BillDialog from "../dialogs/billdialog";
import PaymentDialog from "../dialogs/paymentdialog";
import ReceiptDialog from "../dialogs/receiptdialog";
import { reservationCancel } from "@/app/(private)/console/reservations/actions";
import { toast } from "sonner";
import { getReservationStatusColorClass } from "@/core/helpers";
import RoomChargeDialog from "../dialogs/roomschargedialog";
import { CopyIcon, Trash } from "lucide-react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";


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
          <div className="whitespace-nowrap"><a href={`/console/reservations/${row.id}/edit`}>{row.id.substring(0, 8)}</a>&nbsp;&nbsp;&nbsp;<CopyIcon className="inline w-[20px] cursor-pointer" onClick={e => navigator.clipboard.writeText(row.id)} /></div>
          <span className={`font-bold ${getReservationStatusColorClass(row.reservationStatusText)}`}>{row.reservationStatusText}</span><br />
          <span>{row.reservationTypeText}</span>
          {row.prepaidPackageText ? <span className="font-bold text-[#ff00ff] dark:text-[#ff00ff]"><br />{row.prepaidPackageText}</span> : ''}
          {row.promotionPackageText ? <span className="font-bold text-[#dd5500] dark:text-[#ff9911]"><br />{row.promotionPackageText}</span> : ''}
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
              <div className="flex gap-x-4">
                <a className={`pointer ${customer.tdacFileUrl ? "text-[#00ff00] text-weight-bold" : ""}`} onClick={() => {
                if (customer.tdacFileUrl) {
                  window.open(`/api/public/files?fileUrl=${encodeURIComponent(customer.tdacFileUrl)}`);
                }else{
                  setReservationId(row.original.id);
                  setCustomerId(customer.id);
                  fileInputRef?.current?.click();
                }
              }}>{customer.tdacFileUrl ? "View TDAC File" : "Upload TDAC File"}</a> 
              {customer.tdacFileUrl && <Trash className="pointer text-[#ff0000] max-h-[20px]" onClick={async () => {
                await deleteTDACFile(row.original.id, customer.id, customer.tdacFileUrl);
                formRef?.current?.requestSubmit();
              }} />}
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
              router.push(`/console/reservations/${row.original.id}/edit`);
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
  const [cancelId, setCancelId] = React.useState<string>('');
  const [reservationId, setReservationId] = React.useState('');
  const [customerId, setCustomerId] = React.useState('');
  const [initialFormState, setInitialFormState] = React.useState(formState);
  const [loading, setLoading] = React.useState(false);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true);
    const files = Array.from(event.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = '';

    const formData = new FormData();
    formData.append('file', files[0]);
    formData.append('reservationId', reservationId);
    formData.append('customerId', customerId);

    try {
      const xhr = new XMLHttpRequest();

      const promise = new Promise<{ id: string, fileName: string }>((resolve, reject) => {
        xhr.upload.onprogress = (event) => {
          
        };

        xhr.onload = () => {
          const response = JSON.parse(xhr.responseText);
          if(response.message) toast(response.message);
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              
              resolve({
                id: response.id,
                fileName: response.url
              });
            } catch (error) {
              reject(new Error('Invalid server response'));
            }
          } else {
            reject(new Error(`Upload failed: ${xhr.statusText}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network error'));
        xhr.onabort = () => reject(new Error('Upload cancelled'));
      });

      xhr.open('PATCH', '/api/tdacs');
      xhr.setRequestHeader('Accept', 'application/json');
      xhr.send(formData);

      const result = await promise;

      // setInitialFormState(prev => prev?.data.map(rsv => {
      //   if(rsv.id === reservationId){
      //     rsv.customers = rsv.customers?.map(cus => {
      //       if(cus.id === customerId){
      //         cus.tdacFileUrl = result.fileName;
      //       }
      //       return cus;
      //     });
      //   }
      //   return rsv;
      // }));
      formRef?.current?.requestSubmit();

    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        
      } else {
        
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTDACFile = async (reservationId: string, customerId: string, tdacFileUrl: string) => {
    try{
      setLoading(true);
      const response = await fetch(`/api/tdacs?reservationId=${reservationId}&customerId=${customerId}&tdacFileUrl=${tdacFileUrl}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json'
            }
          });
          const responseData = await response.json();
          if(responseData.message) toast(responseData.message);
    }catch{
      toast("Unknown error occured.");
    }
    setLoading(false);
  }

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
                const response = await reservationCancel(cancelId);
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
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        accept={"pdf"}
        className="hidden"
      />
    </>
  )
}