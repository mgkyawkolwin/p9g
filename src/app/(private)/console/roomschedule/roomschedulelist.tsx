"use client";
import { useActionState, useEffect } from "react";

import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { roomScheduleGetList } from "./actions";
import React from "react";
import { Loader } from "@/components/uicustom/loader";
import { ButtonCustom } from "@/components/uicustom/buttoncustom";
import ScheduleFlexGrid from "@/components/uicustom/scheduleflexgrid";
import { SelectWithLabel } from "@/components/uicustom/selectwithlabel";
import { InputCustom } from "@/components/uicustom/inputcustom";
import { SelectList } from "@/core/lib/constants";
import { getCurrentMonthFirstDate, getCurrentMonthLastDate, getFirstDate, getLastDate } from "@/core/lib/utils";

export default function RoomScheduleList() {

  const formRef = React.useRef<HTMLFormElement>(null);

  const [dateFrom, setDateFrom] = React.useState(getCurrentMonthFirstDate().toISOString());
  const [dateTo, setDateTo] = React.useState(getCurrentMonthLastDate().toISOString());
  const [month, setMonth] = React.useState(String(new Date().getMonth()));
  const [year, setYear] = React.useState(String(new Date().getFullYear())); 
  const [submit, setSubmit] = React.useState(false);


  const [state, formAction, isPending] = useActionState(roomScheduleGetList, {
    error: false,
    message: ""
  });

  useEffect(() => {
    formRef?.current?.requestSubmit();
  }, []);

  useEffect(() => {
    formRef?.current?.requestSubmit();
  }, [submit]);

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
          Room Schedule List
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
             <form ref={formRef} action={formAction} className="flex flex-col gap-4">
              <div className='flex gap-4'>
                <SelectWithLabel label='Choose' items={SelectList.MONTH} defaultValue={month} onValueChange={value => setMonth(value)} />
                <InputCustom value={year} onChange={e => setYear(e.target.value)} />
                <ButtonCustom type="button" onClick={() => {
                  setDateFrom(getFirstDate(Number(year),Number(month)).toISOString());
                  setDateTo(getLastDate(Number(year),Number(month)).toISOString());
                  setSubmit(!submit);
                }}>View</ButtonCustom>
              </div>
              <input type="hidden" name="searchCheckInDateFrom" value={dateFrom} />
              <input type="hidden" name="searchCheckInDateUntil" value={dateTo} />
             </form>
            <ScheduleFlexGrid rooms={state.data?.rooms} month={state.data?.date ? new Date(state.data.date) : undefined} />
          </div>
        </GroupContent>
      </Group>
    </div>

  );
}