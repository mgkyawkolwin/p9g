"use client";
import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/components/uicustom/group";
import { getDailySummaryGuestsRoomsReport } from "./actions";
import React from "react";
import { Loader } from "@/components/uicustom/loader";
import DailySummaryGuestsRoomsReportRow from "@/core/domain/dtos/reports/DailySummaryGuestsRoomsReportrow";
import DailySummaryGuestsRoomsReport from "@/components/reports/dailysummaryguestsroomsreport";
import { ButtonCustom } from "@/components/uicustom/buttoncustom";
import { Label } from "@/components/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputCustom } from "@/components/uicustom/inputcustom";
import { getUTCDateTimeMidNightString, getUTCDateTimeString } from "@/core/lib/utils";

export default function DailySummaryGuestsRoomsReportPage() {

  const [isLoading, setIsLoading] = React.useState(false);
  const [reportRows, setReportRows] = React.useState<DailySummaryGuestsRoomsReportRow[]>([]);
  const [fromDate, setFromDate] = React.useState<Date>(null);
  const [toDate, setToDate] = React.useState<Date>(null);

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
                <div className="flex gap-2">
                  <Label className="text-[10pt]">Check-In From</Label>
                  <DatePicker
                    selected={fromDate}
                    onChange={(date: Date | null) => {
                      setFromDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    customInput={<InputCustom variant="form" size="md" />}
                    placeholderText="yyyy-mm-dd"
                    isClearable={true}
                    showIcon
                  />
                </div>
                <div className="flex gap-2">
                  <Label className="text-[10pt]">Until</Label>
                  <DatePicker
                    selected={toDate}
                    onChange={(date: Date | null) => {
                      setToDate(date);
                    }}
                    dateFormat="yyyy-MM-dd"
                    customInput={<InputCustom variant="form" size="md" />}
                    placeholderText="yyyy-mm-dd"
                    isClearable={true}
                    showIcon
                  />
                </div>
                <ButtonCustom onClick={async () => {
                  setIsLoading(true);
                  const response = await getDailySummaryGuestsRoomsReport(fromDate ? getUTCDateTimeString(fromDate.toLocaleDateString('sv-SE')) : '', toDate ? getUTCDateTimeMidNightString(toDate.toLocaleDateString('sv-SE')) : '');
                  setIsLoading(false);
                  if (response.message)
                    toast(response.message);
                  if (!response.error)
                    setReportRows(response.data);
                }}>Search</ButtonCustom>
              </div>
            </section>
            <DailySummaryGuestsRoomsReport reportRows={reportRows} />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}