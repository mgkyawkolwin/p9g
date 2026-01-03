"use client";
import { toast } from "sonner";
import { Group, GroupContent, GroupTitle } from "@/lib/components/web/react/uicustom/group";
import { getDailySummaryIncomeReport } from "./actions";
import React from "react";
import { Loader } from "@/lib/components/web/react/uicustom/loader";
import { ButtonCustom } from "@/lib/components/web/react/uicustom/buttoncustom";
import DailySummaryIncomeReport from "@/app/components/reports/dailysummaryincomereport";
import DailySummaryIncomeReportRow from "@/core/models/dto/reports/DailySummaryIncomeReportRow";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Label } from "@/lib/components/web/react/ui/label";
import { InputCustom } from "@/lib/components/web/react/uicustom/inputcustom";
import { getISODateTimeMidNightString, getISODateTimeString } from "@/lib/utils";
import { SelectListSearch } from "@/core/constants";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";

export default function DailySummaryIncomeReportPage() {
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportRows, setReportRows] = React.useState<DailySummaryIncomeReportRow[]>([]);
  const [fromDate, setFromDate] = React.useState<Date>(null);
  const [toDate, setToDate] = React.useState<Date>(null);
  const [reservationType, setReservationType] = React.useState<string>('');


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
                <div className="flex gap-2">
                    <SelectWithLabel label="Reservation Type" variant="form" items={SelectListSearch.RESERVATION_TYPE} defaultValue={reservationType} onValueChange={(value) => setReservationType(value)} />
                </div>
              <ButtonCustom onClick={async () => {
                setIsLoading(true);
                const response = await getDailySummaryIncomeReport(fromDate ? getISODateTimeString(fromDate.toLocaleDateString('sv-SE')) : '', toDate ? getISODateTimeMidNightString(toDate.toLocaleDateString('sv-SE')) : '', reservationType);
                setIsLoading(false);
                if(response.message)
                  toast(response.message);
                if(!response.error)
                  setReportRows(response.data);
              }}>Search</ButtonCustom>
              </div>
            </section>
          <DailySummaryIncomeReport reportRows={reportRows}  />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}