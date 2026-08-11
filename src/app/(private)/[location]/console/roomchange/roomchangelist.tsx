"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { roomReservationGetList } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import RoomChangeListTable from "@/app/components/tables/roomchangelisttable";
import { useParams } from 'next/navigation';

export default function RoomChangeList() {
  const params = useParams();
  const location = params.location as string;

  const formRef = React.useRef<HTMLFormElement>(null);

  const [state, formAction, isPending] = useActionState(roomReservationGetList, {
    error: false,
    message: ""
  });

  useEffect(() => {
    if (state.message) {
      toast(state.message);
    }
  }, [state]);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isPending} />
      <Group className="flex w-full">
        <GroupTitle>
          Room Change
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <RoomChangeListTable formState={state} formAction={formAction} formRef={formRef} />
              <input type="hidden" name="location" value={location} />
            </form>
          </div>
        </GroupContent>
      </Group>
    </div>

  );
}