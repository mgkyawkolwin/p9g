'use client';

import React from "react";
import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Button } from "../ui/button";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";
import c from "@/lib/core/logger/ConsoleLogger";
import { ButtonCustom } from "../uicustom/buttoncustom";
import { saveReservation } from "@/app/(private)/console/reservations/new/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Customer from "@/domain/models/Customer";
import Reservation from "@/domain/models/Reservation";

interface ReservationDetailNewFormProps {
    customers?: Customer[]
}

export default function ReservationDetailNewForm({customers}: ReservationDetailNewFormProps)  {
    c.i('Client > ReservationDetailNewForm');

    const router = useRouter();
    const [state, formAction, isPending] = React.useActionState(saveReservation,
        {
            error:false,
            message:''
        });

    const detailFormRef = React.useRef<{ resetForm: () => void }>(null);

    function clearForm(){
        detailFormRef.current?.resetForm();
    }

    React.useEffect(() => {
        if(state.message)
            toast(state.message);
        if(state.reload){
            //router.replace(`/console/reservations/new/?id=${Date.now()}`);
            window.location.reload();
        }
    },[state]);

    return (
        <form action={formAction}>
            <div className="flex flex-col">
            <Group className="flex h-full">
                <GroupTitle>
                    Reservation Details (New)
                </GroupTitle>
                <GroupContent>
                    <div className="flex flex-col gap-4">
                    <ReservationDetailForm ref={detailFormRef} initialReservation={new Reservation()} />
                    <div className="flex gap-4">
                        <ButtonCustom type="submit" variant={"green"} disabled={isPending} >Create Reservation</ButtonCustom>
                        <ButtonCustom type="button" variant={"red"} disabled={isPending} onClick={() => clearForm()}>Clear Form</ButtonCustom>
                    </div>
                    </div>
                </GroupContent>
            </Group>
        </div>
        <input type="hidden" name="customers" value={JSON.stringify(customers?.map(c => ({id:c.id})))} />
        </form>

    );
};