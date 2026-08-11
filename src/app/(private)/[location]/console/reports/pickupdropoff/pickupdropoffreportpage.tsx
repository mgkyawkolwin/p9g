"use client";
import React, { useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { Group, GroupContent, GroupTitle } from '@/lib/components/web/react/uicustom/group';
import { InputCustom } from '@/lib/components/web/react/uicustom/inputcustom';
import { ButtonCustom } from '@/lib/components/web/react/uicustom/buttoncustom';
import { getPickupDropoffReport } from './actions';
import { Loader } from '@/lib/components/web/react/uicustom/loader';
import { useParams } from 'next/navigation';
import PickupDropoffReport from '@/app/components/reports/pickupdropoffreport';

export default function PickupDropoffReportPage() {
  const params = useParams();
  const location = params.location as string;
  const [isLoading, setIsLoading] = React.useState(false);
  const [reportData, setReportData] = React.useState<any>(null);
  const now = new Date();
  const defaultStart = new Date(now);
  defaultStart.setHours(0, 0, 0, 0);
  const defaultEnd = new Date(now);
  defaultEnd.setHours(23, 59, 59, 999);
  const [arrivalStartDateTime, setArrivalStartDateTime] = React.useState<Date>(defaultStart);
  const [arrivalEndDateTime, setArrivalEndDateTime] = React.useState<Date>(defaultEnd);
  const [departureStartDateTime, setDepartureStartDateTime] = React.useState<Date>(defaultStart);
  const [departureEndDateTime, setDepartureEndDateTime] = React.useState<Date>(defaultEnd);

  return (
    <div className="flex flex-1 w-auto">
      <Loader isLoading={isLoading} />
      <Group className="flex w-full">
        <GroupTitle>Pickup/Dropoff Report</GroupTitle>
        <GroupContent>
          <div className="flex flex-col gap-4">
            <section aria-label="reportsearch">
              <div className="flex gap-4 items-end">
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Pickup Date/Time From</div>
                  <DatePicker
                    selected={arrivalStartDateTime}
                    onChange={(date: Date | null) => date && setArrivalStartDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Pickup Date/Time To</div>
                  <DatePicker
                    selected={arrivalEndDateTime}
                    onChange={(date: Date | null) => date && setArrivalEndDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Dropoff Date/Time From</div>
                  <DatePicker
                    selected={departureStartDateTime}
                    onChange={(date: Date | null) => date && setDepartureStartDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
                <div className="grid gap-2">
                  <div className="text-[10pt] font-semibold">Dropoff Date/Time To</div>
                  <DatePicker
                    selected={departureEndDateTime}
                    onChange={(date: Date | null) => date && setDepartureEndDateTime(date)}
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="yyyy-MM-dd HH:mm"
                    customInput={<InputCustom variant="form" size="md" />}
                  />
                </div>
                <div className="mt-4">
                  <ButtonCustom
                    onClick={async () => {
                      setIsLoading(true);
                      const arrivalStart = arrivalStartDateTime.toISOFormatDateTimeString();
                      const arrivalEnd = arrivalEndDateTime.toISOFormatDateTimeString();
                      const departureStart = departureStartDateTime.toISOFormatDateTimeString();
                      const departureEnd = departureEndDateTime.toISOFormatDateTimeString();
                      const res = await getPickupDropoffReport(
                        arrivalStart,
                        arrivalEnd,
                        departureStart,
                        departureEnd,
                        location
                      );
                      setIsLoading(false);
                      if (!res.error) setReportData(res.data);
                    }}
                  >
                    View Report
                  </ButtonCustom>
                </div>
              </div>
            </section>

            {reportData && (
              <PickupDropoffReport
                report={reportData}
                arrivalStartDateTime={arrivalStartDateTime.toISOFormatDateTimeString()}
                arrivalEndDateTime={arrivalEndDateTime.toISOFormatDateTimeString()}
                departureStartDateTime={departureStartDateTime.toISOFormatDateTimeString()}
                departureEndDateTime={departureEndDateTime.toISOFormatDateTimeString()}
              />
            )}
          </div>
        </GroupContent>
      </Group>
    </div>
  );
}
