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
import { SelectListSearch } from "@/core/constants";
import { SelectWithLabel } from "@/lib/components/web/react/uicustom/selectwithlabel";
import { InputWithLabel } from "@/lib/components/web/react/uicustom/inputwithlabel";

export default function DailyReservationDetailReportPage() {

  const [isLoading, setIsLoading] = React.useState(false);
  const [reportRows, setReportRows] = React.useState<DailyReservationDetailReportRow[]>([]);
  const [checkInFrom, setCheckInFrom] = React.useState<Date>(null);
  const [checkInUntil, setCheckInUntil] = React.useState<Date>(null);
  const [createdFrom, setCreatedFrom] = React.useState<Date>(null);
  const [createdUntil, setCreatedUntil] = React.useState<Date>(null);
  const [updatedFrom, setUpdatedFrom] = React.useState<Date>(null);
  const [updatedUntil, setUpdatedUntil] = React.useState<Date>(null);
  const [reservationType, setReservationType] = React.useState<string>(null);
  const [reservationStatus, setReservationStatus] = React.useState<string>(null);
  const [bookingSource, setBookingSource] = React.useState<string>(null);

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
              <div className="flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10pt]">Check-In From</Label>
                      <DatePicker
                        selected={checkInFrom}
                        onChange={(date: Date | null) => {
                          setCheckInFrom(date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom variant="form" size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10pt]">Until</Label>
                      <DatePicker
                        selected={checkInUntil}
                        onChange={(date: Date | null) => {
                          setCheckInUntil(date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom variant="form" size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10pt]">Created From</Label>
                      <DatePicker
                        selected={createdFrom}
                        onChange={(date: Date | null) => {
                          setCreatedFrom(date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom variant="form" size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10pt]">Until</Label>
                      <DatePicker
                        selected={createdUntil}
                        onChange={(date: Date | null) => {
                          setCreatedUntil(date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom variant="form" size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                      />
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10pt]">Updated/Deleted From</Label>
                      <DatePicker
                        selected={updatedFrom}
                        onChange={(date: Date | null) => {
                          setUpdatedFrom(date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom variant="form" size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <Label className="text-[10pt]">Until</Label>
                      <DatePicker
                        selected={updatedUntil}
                        onChange={(date: Date | null) => {
                          setUpdatedUntil(date);
                        }}
                        dateFormat="yyyy-MM-dd"
                        customInput={<InputCustom variant="form" size="md" />}
                        placeholderText="yyyy-mm-dd"
                        isClearable={true}
                        showIcon
                      />
                    </div>
                  </div>
                </div>
                <div className="flex gap-4 items-end">
                  <SelectWithLabel variant="form" label="Reservation Type" labelPosition="top" items={SelectListSearch.RESERVATION_TYPE} defaultValue={reservationType} onValueChange={(value) => setReservationType(value)} />
                  <SelectWithLabel variant="form" label="Reservation Status" labelPosition="top" items={SelectListSearch.RESERVATION_STATUS.set("NOCCL", "No CCL")} defaultValue={reservationStatus} onValueChange={(value) => setReservationStatus(value)} />
                  <InputWithLabel variant="form" labelPosition="top" size="md" name="searchName" label="Booking Source" defaultValue={bookingSource} onChange={(e) => setBookingSource(e.target.value)} />
                  <ButtonCustom onClick={async () => {
                    setIsLoading(true);
                    const response = await getDailyReservationDetailReport(
                      checkInFrom ? getISODateTimeString(checkInFrom.toLocaleDateString('sv-SE')) : '',
                      checkInUntil ? getISODateTimeMidNightString(checkInUntil.toLocaleDateString('sv-SE')) : '',
                      createdFrom ? getISODateTimeString(createdFrom.toLocaleDateString('sv-SE')) : '',
                      createdUntil ? getISODateTimeMidNightString(createdUntil.toLocaleDateString('sv-SE')) : '',
                      updatedFrom ? getISODateTimeString(updatedFrom.toLocaleDateString('sv-SE')) : '',
                      updatedUntil ? getISODateTimeMidNightString(updatedUntil.toLocaleDateString('sv-SE')) : '',
                      reservationType ? (reservationType === "DEFAULT" ? "" : reservationType) : "",
                      reservationStatus ? (reservationStatus === "DEFAULT" ? "" : reservationStatus) : "",
                      bookingSource ?? ""
                    );
                    setIsLoading(false);
                    if (response.message)
                      toast(response.message);
                    if (!response.error)
                      setReportRows(response.data);
                  }}>Search</ButtonCustom>
                </div>
              </div>
            </section>
            <DailyReservationDetailReport reportRows={reportRows} />
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}