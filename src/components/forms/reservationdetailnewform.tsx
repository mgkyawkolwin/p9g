'use client';

import React from "react";
import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";
import { ButtonCustom } from "../uicustom/buttoncustom";
import { saveReservationAction } from "@/app/(private)/console/reservations/new/actions";
import { toast } from "sonner";
import Customer from "@/domain/models/Customer";
import Reservation from "@/domain/models/Reservation";
import { Loader } from "../uicustom/loader";

interface ReservationDetailNewFormProps {
    customers?: Customer[];
    onReservationSaved: () => void;
}

export default function ReservationDetailNewForm({ customers, onReservationSaved }: ReservationDetailNewFormProps) {
    

    const [isPending, setIsPending] = React.useState(false);
    const [reservation, setReservation] = React.useState(new Reservation());

    const detailFormRef = React.useRef<{ resetForm: () => void, getReservation?: () => Reservation }>(null);


    function clearForm() {
        detailFormRef.current?.resetForm();
    }


    async function saveAndCopyReservation() {
        setIsPending(true);
        const r = detailFormRef.current?.getReservation();
        r.customers = customers.map(c => ({ id: c.id } as Customer));
        const response = await saveReservationAction(r as unknown as Reservation);
        if (response.message) toast(response.message);
        if (!response.error && onReservationSaved) onReservationSaved();
        setIsPending(false);
    }


    async function saveReservation() {
        setIsPending(true);
        const r = detailFormRef.current?.getReservation();
        r.customers = customers.map(c => ({ id: c.id } as Customer))
        const response = await saveReservationAction(JSON.parse(JSON.stringify(r)) as unknown as Reservation);
        if (response.message) toast(response.message);
        if (!response.error && onReservationSaved) {
            onReservationSaved();
            setReservation(new Reservation());
        }
        setIsPending(false);
    }


    return (
        <div>
            <Loader isLoading={isPending} />
            <div className="flex flex-col">
                <Group className="flex h-full">
                    <GroupTitle>
                        Reservation Details (New)
                    </GroupTitle>
                    <GroupContent>
                        <div className="flex flex-col gap-4">
                            <ReservationDetailForm ref={detailFormRef} initialReservation={reservation} />
                            <div className="flex gap-4">
                                <ButtonCustom type="button" variant={"green"} disabled={isPending} onClick={() => saveReservation()} >Create Reservation</ButtonCustom>
                                <ButtonCustom type="button" variant={"green"} disabled={isPending} onClick={() => saveAndCopyReservation()} >Create & Copy</ButtonCustom>
                                <ButtonCustom type="button" variant={"red"} disabled={isPending} onClick={() => clearForm()}>Clear Form</ButtonCustom>
                            </div>
                        </div>
                    </GroupContent>
                </Group>
            </div>
        </div>

    );
};