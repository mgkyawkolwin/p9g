'use client';

import React from "react";
import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Button } from "../ui/button";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";
import c from "@/lib/core/logger/ConsoleLogger";
import { ButtonCustom } from "../uicustom/buttoncustom";

interface ReservationDetailNewFormProps {
    formRef?: React.RefObject<HTMLFormElement | null>;
    isPending?: boolean,
    setActionVerb: React.Dispatch<React.SetStateAction<string>>;
}

export default function ReservationDetailNewForm({
    formRef,
    isPending,
    setActionVerb
}: ReservationDetailNewFormProps) {
    c.i('Client > ReservationDetailNewForm');

    const detailFormRef = React.useRef<{ resetForm: () => void }>(null);

    function clearForm(){
        detailFormRef.current?.resetForm();
    }

    return (
        <div className="flex flex-col">
            <Group className="flex h-full">
                <GroupTitle>
                    Reservation Details
                </GroupTitle>
                <GroupContent>
                    <div className="flex flex-col gap-4">
                    <ReservationDetailForm ref={detailFormRef} />
                    <div className="flex gap-4">
                        <ButtonCustom variant={"green"} disabled={isPending} onClick={() => {
                            c.i('[CLICKED] Save Reservation');
                            setActionVerb('SAVE');
                        }}>Save Reservation</ButtonCustom>
                        <ButtonCustom variant={"red"} disabled={isPending} onClick={() => clearForm()}>Clear Form</ButtonCustom>
                    </div>
                    </div>
                </GroupContent>
            </Group>
        </div>

    );
};