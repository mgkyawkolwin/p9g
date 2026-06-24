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
import { SelectList, SelectListSearch } from "@/core/constants";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";
import { CheckboxCustom } from "@/lib/components/web/react/uicustom/CheckboxCustom";
import { useParams } from 'next/navigation';

export default function DailySummaryIncomeReportPage() {
  const params = useParams();
  const location = params.location as string;
  
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportRows, setReportRows] = React.useState<DailySummaryIncomeReportRow[]>([]);
  const [fromDate, setFromDate] = React.useState<Date>(null);
  const [toDate, setToDate] = React.useState<Date>(null);
  const [reservationType, setReservationType] = React.useState<string>('');

  const reservationStatusKeys = React.useMemo(() => Array.from(SelectList.RESERVATION_STATUS.keys()), []);
  const [reservationStatusSelections, setReservationStatusSelections] = React.useState<Record<string, boolean>>(() =>
    reservationStatusKeys.reduce((acc, status) => {
      acc[status] = status !== 'CCL' && status !== 'WTG';
      return acc;
    }, {} as Record<string, boolean>)
  );

  const allReservationStatusesSelected = Object.values(reservationStatusSelections).every(Boolean);
  const selectedReservationStatuses = Object.entries(reservationStatusSelections)
    .filter(([, checked]) => checked)
    .map(([status]) => status);

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
                const reservationStatusPayload = selectedReservationStatuses.join(',');
                const response = await getDailySummaryIncomeReport(
                  fromDate ? getISODateTimeString(fromDate.toLocaleDateString('sv-SE')) : '',
                  toDate ? getISODateTimeMidNightString(toDate.toLocaleDateString('sv-SE')) : '',
                  reservationType,
                  reservationStatusPayload,
                  location
                );
                setIsLoading(false);
                if(response.message)
                  toast(response.message);
                if(!response.error)
                  setReportRows(response.data);
              }}>Search</ButtonCustom>
              </div>
              <div className="mt-4 flex flex-col gap-2">
                <Label className="text-[10pt]">Reservation Status</Label>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <CheckboxCustom
                      id="reservation-status-show-all"
                      checked={allReservationStatusesSelected}
                      onCheckedChange={(checked: boolean) => {
                        setReservationStatusSelections(reservationStatusKeys.reduce((acc, status) => {
                          acc[status] = checked;
                          return acc;
                        }, {} as Record<string, boolean>));
                      }}
                    />
                    <Label htmlFor="reservation-status-show-all">Show All</Label>
                  </div>
                  {reservationStatusKeys.map((status) => (
                    <div className="flex items-center gap-2" key={status}>
                      <CheckboxCustom
                        id={`reservation-status-${status}`}
                        checked={reservationStatusSelections[status]}
                        onCheckedChange={(checked: boolean) => {
                          setReservationStatusSelections((prev) => ({
                            ...prev,
                            [status]: checked
                          }));
                        }}
                      />
                      <Label htmlFor={`reservation-status-${status}`}>{SelectList.RESERVATION_STATUS.get(status) ?? status}</Label>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          <DailySummaryIncomeReport reportRows={reportRows}  />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}