"use client";
import { useEffect } from "react";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { getDailyReservationDetailReport } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import { Label } from "@/lib/components/web/react/ui/label";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { getISODateTimeMidNightString, getISODateTimeString } from "@/lib/utils";
import DailyReservationDetailReportRow from "@/core/models/dto/reports/DailyReservationDetailReportRow";
import DailyReservationDetailReport from "@/app/components/reports/dailyreservationdetailreport";

export default function DailyReservationDetailReportPage() {

  const [isLoading, setIsLoading] = React.useState(false);
  const [reportRows, setReportRows] = React.useState<DailyReservationDetailReportRow[]>([]);
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
                  const response = await getDailyReservationDetailReport(fromDate ? getISODateTimeString(fromDate.toLocaleDateString('sv-SE')) : '', toDate ? getISODateTimeMidNightString(toDate.toLocaleDateString('sv-SE')) : '');
                  setIsLoading(false);
                  if (response.message)
                    toast(response.message);
                  if (!response.error)
                    setReportRows(response.data);
                }}>Search</ButtonCustom>
              </div>
            </section>
            <DailyReservationDetailReport reportRows={reportRows} />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}