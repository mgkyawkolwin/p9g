'use client';

import ReservationDetailForm from "../basicforms/reservationdetailform";
import { Button } from "../ui/button";
import { Group, GroupContent, GroupTitle } from "../uicustom/group";


export default function ReservationDetailNewForm() {

    return (
        <div className="flex flex-col">
            <Group className="flex">
                <GroupTitle>
                    Reservation Details
                </GroupTitle>
                <GroupContent>
                    <ReservationDetailForm />
                    <div className="flex gap-4">
                        <Button>Save Reservation</Button>
                        <Button>Save & Copy</Button>
                    </div>
                </GroupContent>
            </Group>
        </div>

    );
};