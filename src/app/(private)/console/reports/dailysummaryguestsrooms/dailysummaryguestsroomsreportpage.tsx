"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { getDailySummaryGuestsRoomsReport } from "./actions";
import React from "react";
import { Loader } from "@/components/uicustom/loader";
import DailySummaryGuestsRoomsReportRow from "@/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";
import DailySummaryGuestsRoomsReport from "@/components/reports/dailysummaryguestsroomsreport";
import { DateInputWithLabel } from "@/components/uicustom/dateinputwithlabel";
import { ButtonCustom } from "@/components/uicustom/buttoncustom";

export default function DailySummaryGuestsRoomsReportPage() {
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportRows, setReportRows] = React.useState<DailySummaryGuestsRoomsReportRow[]>([]);
  const [fromDate, setFromDate] = React.useState("");
  const [toDate, setToDate] = React.useState("");

  useEffect(() => {
  }, []);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isLoading} />
      <Group className="flex w-full">
        <GroupTitle>
          Report
        </GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <section aria-label="reportsearch">
              <div className="flex gap-4">
              <DateInputWithLabel type="date" label="Check-In From" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
              <DateInputWithLabel type="date" label="Until" value={toDate} onChange={(e) => setToDate(e.target.value)}/>
              <ButtonCustom onClick={async () => {
                setIsLoading(true);
                const response = await getDailySummaryGuestsRoomsReport(fromDate, toDate);
                setIsLoading(false);
                if(response.message)
                  toast(response.message);
                if(!response.error)
                  setReportRows(response.data);
              }}>Search</ButtonCustom>
              </div>
            </section>
          <DailySummaryGuestsRoomsReport reportRows={reportRows}  />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}