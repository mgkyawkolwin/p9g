'use client';

import React from "react";
import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";
import { ButtonCustom } from "../uicustom/buttoncustom";
import Customer from "@/core/domain/models/Customer";
import Reservation from "@/core/domain/models/Reservation";
import { updateReservationAction } from "@/app/(private)/console/reservations/[id]/edit/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader } from "../uicustom/loader";

interface ReservationDetailEditFormProps {
    customers?: Customer[];
    reservation: Reservation;
    onReservationSaved?: () => void;
}

export default function ReservationDetailEditForm({
    customers,
    reservation,
    onReservationSaved
}: ReservationDetailEditFormProps) {

    const router = useRouter();

    const [isPending, setIsPending] = React.useState(false);

    const detailFormRef = React.useRef<{ resetForm: () => void, getReservation?: () => Reservation }>(null);


    async function saveReservation() {
        setIsPending(true);
        const r = detailFormRef.current?.getReservation();
        r.customers = customers.map(c => ({ id: c.id } as Customer))
        const response = await updateReservationAction(JSON.parse(JSON.stringify(r)) as unknown as Reservation);
        setIsPending(false);
        if (response.message) toast(response.message);
        if (!response.error) {
            if(onReservationSaved) onReservationSaved();
            router.push('/console/reservations');
        }
    }


    return (
        <div className="flex flex-col">
            <Loader isLoading={isPending} />
            <Group className="flex h-full">
                <GroupTitle>
                    Reservation Details (Edit)
                </GroupTitle>
                <GroupContent>
                    <div className="flex flex-col gap-4">
                        <ReservationDetailForm ref={detailFormRef} initialReservation={reservation} />
                        <div className="flex gap-4">
                            <ButtonCustom type="button" variant={"green"} disabled={isPending} onClick={() => {
                                saveReservation();
                            }}>Update Reservation</ButtonCustom>
                            <ButtonCustom type="button" variant={"red"} disabled={isPending} onClick={() => {
                                window.location.reload();
                            }}>Reset</ButtonCustom>
                        </div>
                    </div>
                </GroupContent>
            </Group>
        </div>

    );
};