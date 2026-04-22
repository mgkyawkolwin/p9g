'use client';

import React from "react";
import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Group, GroupContent, GroupTitle } from "../../../lib/components/web/react/uicustom/group";
import { ButtonCustom } from "../../../lib/components/web/react/uicustom/buttoncustom";
import Customer from "@/core/models/domain/Customer";
import Reservation from "@/core/models/domain/Reservation";
import { updateReservationAction } from "@/app/(private)/[location]/console/reservations/[id]/edit/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader } from "../../../lib/components/web/react/uicustom/loader";
import { useParams } from "next/navigation";

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
    const params = useParams();
    const location = params.location as string;

    const router = useRouter();

    const [isPending, setIsPending] = React.useState(false);

    const detailFormRef = React.useRef<{ resetForm: () => void, getReservation?: () => Reservation }>(null);


    async function saveReservation() {
        setIsPending(true);
        const r = detailFormRef.current?.getReservation();
        r.customers = customers.map(c => ({ id: c.id } as Customer))
        const response = await updateReservationAction(JSON.parse(JSON.stringify(r)) as unknown as Reservation, location);
        setIsPending(false);
        if (response.message) toast(response.message);
        if (!response.error) {
            if(onReservationSaved) onReservationSaved();
            router.push(`/${location}/console/reservations`);
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