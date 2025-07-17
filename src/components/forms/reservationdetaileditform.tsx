'use client';

import React from "react";
import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";
import c from "@/lib/core/logger/ConsoleLogger";
import { ButtonCustom } from "../uicustom/buttoncustom";
import Customer from "@/domain/models/Customer";
import Reservation from "@/domain/models/Reservation";
import { updateReservationAction } from "@/app/(private)/console/reservations/[id]/edit/actions";
import { toast } from "sonner";

interface ReservationDetailEditFormProps {
    customers?: Customer[];
    reservation: Reservation;
}

export default function ReservationDetailEditForm({
    customers,
    reservation
}: ReservationDetailEditFormProps) {
    c.i('Client > ReservationDetailEditForm');

    const detailFormRef = React.useRef<{ resetForm: () => void }>(null);

    const [state, formAction, isPending] = React.useActionState(updateReservationAction, {
        error: false,
        message:''
    });

    // function clearForm(){
    //     detailFormRef.current?.resetForm();
    // }

    React.useEffect(() => {
        if(state.message)
            toast(state.message);
        if(state.reload)
            window.location.reload();
    },[state]);

    return (
        <form className="flex h-full" action={formAction}>
            <div className="flex flex-col">
            <Group className="flex h-full">
                <GroupTitle>
                    Reservation Details (Edit)
                </GroupTitle>
                <GroupContent>
                    <div className="flex flex-col gap-4">
                    <ReservationDetailForm ref={detailFormRef} initialReservation={reservation} />
                    <div className="flex gap-4">
                        <ButtonCustom variant={"green"} disabled={isPending} onClick={() => {
                            
                        }}>Update Reservation</ButtonCustom>
                        <ButtonCustom variant={"red"} disabled={isPending} onClick={() => {
                            
                        }}>Cancel</ButtonCustom>
                    </div>
                    </div>
                </GroupContent>
            </Group>
        </div>
        <input type="hidden" name="id" defaultValue={reservation.id} />
        <input type="hidden" name="customers" defaultValue={JSON.stringify(customers?.map(c => ({id:c.id})))} />
        </form>

    );
};