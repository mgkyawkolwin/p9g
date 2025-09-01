"use client"

import * as React from "react";

import {
    ColumnDef
} from "@tanstack/react-table";
import { ButtonCustom } from "../uicustom/buttoncustom"
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "../ui/dialog"
import { roomReservationGetListById, roomReservationUpdateList } from "@/app/(private)/console/reservations/actions"
import { toast } from "sonner";
import { InputCustom } from "../uicustom/inputcustom";
import { Checkbox } from "../ui/checkbox";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import RoomReservation from "@/domain/models/RoomReservation";
import RoomCharge from "@/domain/models/RoomCharge";
import SimpleDataTable from "../tables/simpledatatable";


interface DataTableProps {
    reservationId: string;
    callbackFunctions: (func: {
        openDialog: (open: boolean) => void;
    }) => void;
}

export default function RoomChargeDialog({
    reservationId,
    callbackFunctions
}: DataTableProps) {

    const [open, setOpen] = React.useState(false);
    const [roomReservations, setRoomReservations] = React.useState<RoomReservation[]>([]);
    const [selectedRoomReservation, setSelectedRoomReservation] = React.useState<RoomReservation>(null);
    const [visibleRoomReservations, setVisibleRoomReservations] = React.useState<RoomReservation[]>([]);
    const [visibleRoomCharges, setVisibleRoomCharges] = React.useState<RoomCharge[]>([]);

    const openDialog = (open: boolean) => {
        setOpen(open);
    };


    React.useEffect(() => {
        if (callbackFunctions) {
            callbackFunctions({ openDialog });
        }
    }, [callbackFunctions]);


    const handleRoomInputChange = (id: string, rowIndex: number, field: string, value: string | Date | boolean | undefined) => {
        setRoomReservations(prev => {
            const updatedRoomReservations : RoomReservation[] = prev.map((roomReservation:RoomReservation) =>
                roomReservation.id === id
                    ? {
                        ...roomReservation, // Preserve existing fields
                        [field]: value, // Update the specific field
                        modelState: roomReservation.modelState === "inserted" ? "inserted" : "updated"
                    }
                    : roomReservation
            );
            setVisibleRoomReservations(updatedRoomReservations.filter(rr => rr.modelState !== "deleted"));
            return updatedRoomReservations;
        });
    };

    const handleChargeInputChange = (id:string, rowIndex: number, field: string, value: string | Date | boolean | undefined) => {
        if (selectedRoomReservation !== null) {
            setVisibleRoomCharges(prev =>
                prev.map((roomCharge) =>
                    roomCharge.id === id ? { ...roomCharge, [field]: value, modelState: roomCharge.modelState == "inserted" ? "inserted" : "updated"  } : roomCharge
                )
            );

            setRoomReservations(prev =>
                prev.map((roomReservation) => {
                    if (roomReservation.id === selectedRoomReservation.id) {
                        const updatedCharges : RoomCharge[] = roomReservation.roomCharges.map((roomCharge:RoomCharge) =>
                            roomCharge.id === id ? { ...roomCharge, [field]: value, modelState: roomCharge.modelState == "inserted" ? "inserted" : "updated" } : roomCharge
                        );
                        return { ...roomReservation, roomCharges: updatedCharges };
                    }
                    return roomReservation;
                })
            );

            setVisibleRoomReservations(roomReservations.filter(rr => rr.modelState !== "deleted"));

            
        }
    };


    const addRoom = () => {
        const rr = new RoomReservation();
        rr.modelState = "inserted";
        rr.reservationId = reservationId;
        setRoomReservations(prev => [...prev, rr]);
        setVisibleRoomReservations(prev => [...prev, rr]);
    };


    const addCharge = () => {
        if (selectedRoomReservation !== null) {
            const newCharge = new RoomCharge();
            newCharge.modelState = "inserted";
            newCharge.reservationId = reservationId;

            setRoomReservations(prev =>
                prev.map((roomReservation:RoomReservation) => {
                    if (roomReservation.id === selectedRoomReservation.id) {
                        newCharge.roomTypeId = roomReservation.roomTypeId;
                        newCharge.roomId = roomReservation.roomId;
                        const updatedCharges: RoomCharge[] = [...roomReservation.roomCharges, newCharge] as RoomCharge[];
                        return { ...roomReservation, roomCharges: updatedCharges };
                    }
                    return roomReservation;
                })
            );

            setVisibleRoomReservations(roomReservations.filter(rr => rr.modelState !== "deleted"));
            setVisibleRoomCharges(prev => [...prev, newCharge] as RoomCharge[]);
        }
    };


    const handleCheckboxChange = (id:string, rowIndex: number, checked: boolean) => {
        if (checked) {
            const selectedReservation = roomReservations.find(rr => rr.id === id);
            setSelectedRoomReservation(selectedReservation);
            setVisibleRoomCharges(
                selectedReservation?.roomCharges && selectedReservation.roomCharges.length > 0
                    ? [...selectedReservation.roomCharges]
                    : []
            );
        } else {
            setSelectedRoomReservation(null);
            setVisibleRoomCharges([]);
        }
    };


    const roomReservationColumns = React.useMemo<ColumnDef<RoomReservation>[]>(() => [
        {
            accessorKey: "check",
            header: '',
            cell: (row) => <Checkbox key={`${row.row.original.id}-check`}
                checked={selectedRoomReservation && selectedRoomReservation.id === row.row.original.id}
                onCheckedChange={(checked) => handleCheckboxChange(row.row.original.id, row.row.index, Boolean(checked.valueOf()))}
            />
        },
        {
            accessorKey: "roomNo",
            header: 'Room No',
            cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-itemName`} // Crucial for maintaining focus
                value={row.row.original.roomNo ? row.row.original.roomNo : ''}  
                onChange={e => {
                    handleRoomInputChange(row.row.original.id, row.row.index, "roomNo", e.target.value || e.target.value?.trim() !== '' ? e.target.value : undefined);
                }} />
        },
        {
            accessorKey: "roomType",
            header: 'Room Type',
        },
        {
            accessorKey: "isSingleOccupancy",
            header: 'Single',
            cell: (row) => <Checkbox key={`${row.row.original.id}-isSingleOccupancy`}
                checked={Boolean(row.row.original.isSingleOccupancy)}
                onCheckedChange={(checked) => {
                    handleRoomInputChange(row.row.original.id, row.row.index, "isSingleOccupancy", checked.valueOf());

                }} />
        },
        {
            accessorKey: "checkInDateUTC",
            header: 'Check In',
            cell: (row) => <DatePicker key={`${row.row.original.id}-checkInDateUTC`}
                selected={row.row.original.checkInDateUTC}
                onChange={(date: Date | null) => {
                    handleRoomInputChange(row.row.original.id, row.row.index, "checkInDateUTC", date);
                }}
                dateFormat="yyyy-MM-dd"
                customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                placeholderText="yyyy-mm-dd"
                isClearable={true}
                showIcon
            />
        },
        {
            accessorKey: "checkOutDateUTC",
            header: 'Check Out',
            cell: (row) => <DatePicker key={`${row.row.original.id}-checkOutDateUTC`}
                selected={row.row.original.checkOutDateUTC}
                onChange={(date: Date | null) => {
                    handleRoomInputChange(row.row.original.id, row.row.index, "checkOutDateUTC", date);
                }}
                dateFormat="yyyy-MM-dd"
                customInput={<InputCustom size="md" />} // Uses shadcn/ui Input
                placeholderText="yyyy-mm-dd"
                isClearable={true}
                showIcon
            />
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: (row) => {
                return <div>
                    {getRoomReservationActionButton(row.row.original.id, reservationId, row.row.index)}
                </div>
            }
        },
    ], [reservationId, open, roomReservations.length, selectedRoomReservation]);


    const roomChargesColumns = React.useMemo<ColumnDef<RoomCharge>[]>(() => [
        {
            accessorKey: "roomRate",
            header: 'Room Rate',
            cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-roomRate`} // Crucial for maintaining focus
                value={row.row.original.roomRate}
                onChange={e => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "roomRate", e.target.value);
                }} />
        },
        {
            accessorKey: "singleRate",
            header: 'Single Rate',
            cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-singleRate`} // Crucial for maintaining focus
                value={row.row.original.singleRate}
                onChange={e => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "singleRate", e.target.value);
                }} />
        },
        {
            accessorKey: "roomSurcharge",
            header: 'Room Surcharge',
            cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-roomSurcharge`} // Crucial for maintaining focus
                value={row.row.original.roomSurcharge}
                onChange={e => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "roomSurcharge", e.target.value);
                }} />
        },
        {
            accessorKey: "seasonSurcharge",
            header: 'Season Surcharge',
            cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-seasonSurcharge`} // Crucial for maintaining focus
                value={row.row.original.seasonSurcharge}
                onChange={e => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "seasonSurcharge", e.target.value);
                }} />
        },
        {
            accessorKey: "startDateUTC",
            header: 'Start Date',
            cell: (row) => <DatePicker key={`${row.row.original.id}-startDateUTC`}
                selected={row.row.original.startDateUTC}
                onChange={(date: Date | null) => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "startDateUTC", date);
                }}
                dateFormat="yyyy-MM-dd"
                customInput={<InputCustom size="sm" />} // Uses shadcn/ui Input
                placeholderText="yyyy-mm-dd"
                showIcon
            />
        },
        {
            accessorKey: "endDateUTC",
            header: 'End Date',
            cell: (row) => <DatePicker key={`${row.row.original.id}-endDateUTC`}
                selected={row.row.original.endDateUTC}
                onChange={(date: Date | null) => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "endDateUTC", date);
                }}
                dateFormat="yyyy-MM-dd"
                customInput={<InputCustom size="sm" />} // Uses shadcn/ui Input
                placeholderText="yyyy-mm-dd"
            />
        },
        {
            accessorKey: "noOfDays",
            header: 'Days',
            cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-noOfDays`} // Crucial for maintaining focus
                value={row.row.original.noOfDays}
                onChange={e => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "noOfDays", e.target.value);
                }} />
        },
        {
            accessorKey: "totalRate",
            header: 'Total Rate',
            cell: (row) => <InputCustom size={"xs"} key={`${row.row.original.id}-totalRate`} // Crucial for maintaining focus
                value={row.row.original.totalRate}
                onChange={e => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "totalRate", e.target.value);
                }} />
        },
        {
            accessorKey: "totalAmount",
            header: 'Total Amount',
            cell: (row) => <InputCustom size={"sm"} key={`${row.row.original.id}-totalAmount`} // Crucial for maintaining focus
                value={row.row.original.totalAmount}
                onChange={e => {
                    handleChargeInputChange(row.row.original.id, row.row.index, "totalAmount", e.target.value);
                }} />
        },
        {
            accessorKey: "action",
            header: "Action",
            cell: (row) => {
                return <div>
                    {getRoomChargeActionButton(row.row.original.id, reservationId, row.row.index)}
                </div>
            }
        },
    ], [reservationId, open, visibleRoomCharges.length, selectedRoomReservation]);


    function getRoomChargeActionButton(id: string, reservationId: string, rowIndex: number) {
        return <ButtonCustom type="button" variant={"red"} size={"sm"}
                onClick={async () => {
                    const updatedRoomCharges = visibleRoomCharges.reduce((acc:RoomCharge[], rc:RoomCharge) => {
                        if(rc.id === id){
                            if(rc.modelState !== "inserted"){
                                rc.modelState = "deleted";
                                acc.push(rc);
                            }
                        }else{
                            acc.push(rc);
                        }
                        return acc;
                    }, [] as RoomCharge[]);
                    setRoomReservations(prev => prev.map((roomReservation:RoomReservation) => {
                        if (roomReservation.id === selectedRoomReservation.id) {
                            roomReservation.roomCharges = updatedRoomCharges;
                        }
                        return roomReservation;
                    }));
                    setVisibleRoomCharges(updatedRoomCharges.filter(rc => rc.modelState !== "deleted"));
                }}>Delete</ButtonCustom>;
    }


    function getRoomReservationActionButton(id: string, reservationId: string, rowIndex: number) {
        return <ButtonCustom type="button" variant={"red"} size={"sm"}
                onClick={async () => {
                    const updatedRoomReservations = roomReservations.reduce((acc:RoomReservation[], rr:RoomReservation) => {
                        if(rr.id === id){
                            if(rr.modelState !== "inserted"){
                                rr.modelState = "deleted";
                                acc.push(rr);
                            }
                        }else{
                            acc.push(rr);
                        }
                            
                        return acc;
                    },[] as RoomReservation[]);

                    setRoomReservations(updatedRoomReservations);

                    setVisibleRoomReservations(updatedRoomReservations.filter(rr => rr.modelState !== "deleted"));

                    if(selectedRoomReservation && id === selectedRoomReservation.id)
                    {
                        setSelectedRoomReservation(null);
                        setVisibleRoomCharges([]);
                    }
                }}>Delete</ButtonCustom>;
    }


    const fetchData = async () => {
        try {
            //retrieve room reservation list
            const rrResponse = await roomReservationGetListById(reservationId);
            if (rrResponse.message)
                toast(rrResponse.message);
            if (rrResponse.data) {
                const rrs = rrResponse.data.map((roomReservation: RoomReservation) => (
                    {
                        ...roomReservation,
                        checkInDateUTC: new Date(roomReservation.checkInDateUTC),
                        checkOutDateUTC: new Date(roomReservation.checkOutDateUTC)
                    }
                ));
                setRoomReservations(rrs);
                setVisibleRoomReservations(rrs);
            }
        } catch (error) {
            toast("An error occurred while fetching data. Please try again.");
        }
    };


    React.useEffect(() => {
        if (!reservationId || reservationId === 'undefined') return;
        if (!open) return;

        //reset data
        setRoomReservations([]);
        setSelectedRoomReservation(null);
        setVisibleRoomReservations([]);
        setVisibleRoomCharges([]);

        fetchData();
    }, [reservationId, open]);


    return (
        <Dialog open={open} onOpenChange={setOpen} >
            <DialogContent className="flex flex-col min-h-[80vh] min-w-[95vw]">
                <DialogHeader>
                    <DialogTitle>Room Reservations & Charges</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-y-10">
                    <div className="flex">
                        <SimpleDataTable columns={roomReservationColumns} data={visibleRoomReservations} />
                    </div>
                    <div className="flex"> {/* Ensure calendar is not clipped */}
                        <SimpleDataTable columns={roomChargesColumns} data={visibleRoomCharges} />
                    </div>
                </div>
                <DialogFooter className="">
                    <ButtonCustom onClick={addRoom}>Add Room</ButtonCustom>
                    <ButtonCustom onClick={addCharge}>Add Charge</ButtonCustom>
                    <ButtonCustom type="button" variant="green" 
                    onClick={async () => {
                        const response = await roomReservationUpdateList(reservationId, roomReservations);
                        toast(response.message);
                        if (!response.error)
                            setOpen(false);
                    }}>Save</ButtonCustom>
                    <DialogClose asChild>
                        <ButtonCustom variant="black" onClick={() => {

                        }}>Close</ButtonCustom>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}