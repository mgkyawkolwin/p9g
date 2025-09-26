'use client';

import React from "react";
import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Group, GroupContent, GroupTitle } from "../../../lib/components/web/react/uicustom/group";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import { saveReservationAction } from "@/app/(private)/console/reservations/new/actions";
import { toast } from "sonner";
import Customer from "@/core/models/domain/Customer";
import Reservation from "@/core/models/domain/Reservation";
import { Loader } from "../../../lib/components/web/react/uicustom/loader";
import {v4 as uuidv4} from 'uuid';

interface ReservationDetailNewFormProps {
    customers?: Customer[];
    onReservationSaved: (copy: boolean) => void;
}

export default function ReservationDetailNewForm({ customers, onReservationSaved }: ReservationDetailNewFormProps) {
    

    const [isPending, setIsPending] = React.useState(false);
    const [reservation, setReservation] = React.useState<Reservation>({...new Reservation(), modelState: "inserted"});

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
        if (!response.error && onReservationSaved){ 
            onReservationSaved(true);
            setReservation(prev => ({...r, id: uuidv4()}));
        }
        setIsPending(false);
    }


    async function saveReservation() {
        setIsPending(true);
        const r = detailFormRef.current?.getReservation();
        r.customers = customers.map(c => ({ id: c.id } as Customer))
        const response = await saveReservationAction(JSON.parse(JSON.stringify(r)) as unknown as Reservation);
        if (response.message) toast(response.message);
        if (!response.error && onReservationSaved) {
            onReservationSaved(false);
            setReservation({...new Reservation(), modelState: "inserted"});
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